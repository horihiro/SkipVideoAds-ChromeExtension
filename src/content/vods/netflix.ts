import { SkipMode, Vod } from "../vod";

export class Netflix extends Vod {
  protected static SELECTOR_VIDEO: string = "video" as const;
  protected static SELECTOR_AD_TEXT: string = '[data-uia="ads-info-text"]' as const;
  protected static SELECTOR_AD_TIME: string = '[data-uia="ads-info-time"]' as const;
  protected static PLAYBACK_RATE_SKIP: number = 8 as const;

  private originalAudioState = new WeakMap<HTMLMediaElement, { volume: number; muted: boolean }>();

  static isAvailable(): boolean {
    return /netflix\.com\//.test(location.href);
  }

  static injection(): boolean {
    // seeking / ratechange の監視登録を抑止
    (HTMLMediaElement.prototype as any)._addEventListener =
      (HTMLMediaElement.prototype as any)._addEventListener || HTMLMediaElement.prototype.addEventListener;

    HTMLMediaElement.prototype.addEventListener = function (...args: any[]) {
      const type = String(args?.[0] ?? "").toLowerCase();
      if (["seeking", "ratechange"].includes(type)) return;
      return (this as any)._addEventListener(...args);
    };

    // onxxx プロパティ経由の監視登録も抑止
    const blockProps = ["onseeking", "onratechange"] as const;
    for (const prop of blockProps) {
      try {
        Object.defineProperty(HTMLMediaElement.prototype, prop, {
          set() { /* noop */ },
          get() { return null; },
          configurable: true,
        });
      } catch {
        // 定義不可な環境は無視
      }
    }

    return true;
  }

  private isAdPlaying(): boolean {
    const adTimeElm = document.querySelector(Netflix.SELECTOR_AD_TIME) as HTMLElement | null;
    if (!adTimeElm || !adTimeElm.checkVisibility()) return false;

    const timeText = (adTimeElm.textContent || "").trim();
    // "25" / "25s" / "25 秒" のような先頭数値を許容
    const remaining = Number.parseInt(timeText, 10);
    if (!Number.isFinite(remaining) || remaining <= 0) return false;

    // 補助条件: ads-info-text が同時に存在すれば信頼度を上げる（文言は見ない）
    const adTextElm = document.querySelector(Netflix.SELECTOR_AD_TEXT) as HTMLElement | null;
    if (!adTextElm || !adTextElm.checkVisibility()) return false;

    return true;
  }

  private muteWhileSkipping(videoElm: HTMLMediaElement): void {
    if (!this.originalAudioState.has(videoElm)) {
      this.originalAudioState.set(videoElm, {
        volume: videoElm.volume,
        muted: videoElm.muted,
      });
    }
    videoElm.volume = 0;
    videoElm.muted = true;
  }

  private restoreAudio(videoElm: HTMLMediaElement): void {
    const original = this.originalAudioState.get(videoElm);
    if (!original) return;

    videoElm.volume = original.volume;
    videoElm.muted = original.muted;
    this.originalAudioState.delete(videoElm);
  }

  startWatching(skipMode: SkipMode = SkipMode.auto): void {
    if (skipMode === SkipMode.none) return;

    // 初期化
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(`.${this.selectorOverlay}`)).forEach((e) => e.remove());
    (Array.from(document.querySelectorAll(Netflix.SELECTOR_VIDEO)) as HTMLMediaElement[]).forEach((v) => {
      v.ontimeupdate = null;
      if (v.playbackRate !== 1) v.playbackRate = 1;
      this.restoreAudio(v);
    });

    this.observer = new MutationObserver(() => {
      const videoElm = (Array.from(document.querySelectorAll(Netflix.SELECTOR_VIDEO)) as HTMLMediaElement[])
        .find((v) => !v.ontimeupdate);
      if (!videoElm) return;

      videoElm.ontimeupdate = () => {
        const overlay = this.getOverlay(skipMode);
        const adPlaying = this.isAdPlaying();

        if (!adPlaying) {
          overlay.parentElement && overlay.remove();
          if (videoElm.playbackRate !== 1) videoElm.playbackRate = 1;
          this.restoreAudio(videoElm);
          return;
        }

        overlay.style.height = `${videoElm.clientHeight || 0}px`;
        !overlay.parentElement && videoElm.parentElement?.appendChild(overlay);

        if (skipMode === SkipMode.auto) {
          if (videoElm.playbackRate !== Netflix.PLAYBACK_RATE_SKIP) {
            videoElm.playbackRate = Netflix.PLAYBACK_RATE_SKIP;
          }
          this.muteWhileSkipping(videoElm);
        } else if (skipMode === SkipMode.manual) {
          if (!overlay.onclick) {
            overlay.onclick = () => {
              videoElm.playbackRate = Netflix.PLAYBACK_RATE_SKIP;
              this.muteWhileSkipping(videoElm);
              overlay.onclick = null;
            };
          }
        }
      };
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}