import { SkipMode, Vod } from "../vod";

export class Netflix extends Vod {
  protected static SELECTOR_VIDEO: string = "video" as const;
  protected static SELECTOR_AD_TEXT: string = '[data-uia="ads-info-text"]' as const;
  protected static SELECTOR_AD_TIME: string = '[data-uia="ads-info-time"]' as const;
  protected static PLAYBACK_RATE_SKIP: number = 8 as const;

  private originalAudioState = new WeakMap<HTMLMediaElement, { volume: number; muted: boolean }>();
  private originalPlaybackRate = new WeakMap<HTMLMediaElement, number>();
  private keepSkipTimerByVideo = new Map<HTMLMediaElement, number>();
  private audioRestoreGuardByVideo = new Map<HTMLMediaElement, number>();
  private syncScheduled = false;

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

    // volume 及び muted の setter を保護（Netflix による巻き戻しを防止）
    const origVolDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
    const origMutedDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted');

    if (origVolDesc?.set) {
      const nativeVolSet = origVolDesc.set;
      (HTMLMediaElement.prototype as any)._setVolume = nativeVolSet;
    }
    if (origMutedDesc?.set) {
      const nativeMutedSet = origMutedDesc.set;
      (HTMLMediaElement.prototype as any)._setMuted = nativeMutedSet;
    }

    return true;
  }
  static getVODName(): string {
    return 'Netflix';
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
      const originalState = {
        volume: videoElm.volume,
        muted: videoElm.muted,
      };
      this.originalAudioState.set(videoElm, originalState);
    }
    // 毎回無音化を再実行（Netflix による復帰に対抗）
    if (videoElm.volume !== 0) videoElm.volume = 0;
    if (!videoElm.muted) videoElm.muted = true;
  }

  private restoreAudio(videoElm: HTMLMediaElement): void {
    const original = this.originalAudioState.get(videoElm);
    if (!original) return;

    // 既存の復帰ガードを止める
    const existingGuard = this.audioRestoreGuardByVideo.get(videoElm);
    if (existingGuard) {
      clearInterval(existingGuard);
      this.audioRestoreGuardByVideo.delete(videoElm);
    }

    // 確実に復帰させる
    videoElm.volume = original.volume;
    videoElm.muted = original.muted;
    
    // さらに確認で再設定
    if (videoElm.volume !== original.volume) {
      videoElm.volume = original.volume;
    }
    if (videoElm.muted !== original.muted) {
      videoElm.muted = original.muted;
    }

    // Netflix側の直後上書きに備えて、短時間だけ復帰値を維持する
    const guardStartedAt = Date.now();
    const guardTimer = window.setInterval(() => {
      if (this.isAdPlaying()) return;

      if (videoElm.volume !== original.volume) {
        videoElm.volume = original.volume;
      }
      if (videoElm.muted !== original.muted) {
        videoElm.muted = original.muted;
      }

      if (Date.now() - guardStartedAt > 1500) {
        const timerId = this.audioRestoreGuardByVideo.get(videoElm);
        if (timerId) {
          clearInterval(timerId);
          this.audioRestoreGuardByVideo.delete(videoElm);
        }
        this.originalAudioState.delete(videoElm);
      }
    }, 100);
    this.audioRestoreGuardByVideo.set(videoElm, guardTimer);
  }

  private startKeepSkip(videoElm: HTMLMediaElement, skipMode: SkipMode): void {
    if (this.keepSkipTimerByVideo.has(videoElm)) return;

    this.originalPlaybackRate.set(videoElm, videoElm.playbackRate);

    const timerId = window.setInterval(() => {
      if (skipMode === SkipMode.none || !this.isAdPlaying()) return;

      if (videoElm.playbackRate !== Netflix.PLAYBACK_RATE_SKIP) {
        videoElm.playbackRate = Netflix.PLAYBACK_RATE_SKIP;
      }
      this.muteWhileSkipping(videoElm);
    }, 100);
    this.keepSkipTimerByVideo.set(videoElm, timerId);
  }

  private stopKeepSkip(videoElm: HTMLMediaElement): void {
    const timerId = this.keepSkipTimerByVideo.get(videoElm);
    const hasAudioBackup = this.originalAudioState.has(videoElm);
    const hasPlaybackBackup = this.originalPlaybackRate.has(videoElm);

    if (!timerId && !hasAudioBackup && !hasPlaybackBackup) {
      return;
    }

    if (timerId) {
      clearInterval(timerId);
      this.keepSkipTimerByVideo.delete(videoElm);
    }

    const originalPlaybackRate = this.originalPlaybackRate.get(videoElm);
    if (typeof originalPlaybackRate === 'number' && videoElm.playbackRate !== originalPlaybackRate) {
      videoElm.playbackRate = originalPlaybackRate;
    }
    this.originalPlaybackRate.delete(videoElm);

    this.restoreAudio(videoElm);
  }

  private isRelevantMutationNode(node: Node | null): boolean {
    if (!(node instanceof Element)) {
      return false;
    }

    return node.matches(Netflix.SELECTOR_VIDEO)
      || node.matches(Netflix.SELECTOR_AD_TEXT)
      || node.matches(Netflix.SELECTOR_AD_TIME)
      || !!node.querySelector(Netflix.SELECTOR_VIDEO)
      || !!node.querySelector(Netflix.SELECTOR_AD_TEXT)
      || !!node.querySelector(Netflix.SELECTOR_AD_TIME);
  }

  private isRelevantMutation(mutations: MutationRecord[]): boolean {
    return mutations.some((mutation) => {
      if (mutation.type === 'childList') {
        return Array.from(mutation.addedNodes).some((node) => this.isRelevantMutationNode(node))
          || Array.from(mutation.removedNodes).some((node) => this.isRelevantMutationNode(node))
          || this.isRelevantMutationNode(mutation.target);
      }

      if (mutation.type === 'attributes') {
        return this.isRelevantMutationNode(mutation.target);
      }

      if (mutation.type === 'characterData') {
        return this.isRelevantMutationNode(mutation.target.parentElement);
      }

      return false;
    });
  }

  private syncVideos(skipMode: SkipMode): void {
    const videos = Array.from(document.querySelectorAll(Netflix.SELECTOR_VIDEO)) as HTMLMediaElement[];

    this.keepSkipTimerByVideo.forEach((_, videoElm) => {
      if (!videos.includes(videoElm)) {
        this.stopKeepSkip(videoElm);
      }
    });

    if (videos.length < 1) {
      Array.from(document.querySelectorAll(`.${this.selectorOverlay}`)).forEach((e) => e.remove());
      return;
    }

    videos.forEach((videoElm) => this.applyAdState(videoElm, skipMode));
  }

  private scheduleSync(skipMode: SkipMode): void {
    if (this.syncScheduled) return;

    this.syncScheduled = true;
    this.syncVideos(skipMode);
    this.syncScheduled = false;
  }

  private applyAdState(videoElm: HTMLMediaElement, skipMode: SkipMode): void {
    const overlay = this.getOverlay(skipMode);
    const adPlaying = this.isAdPlaying();

    if (!adPlaying) {
      overlay.parentElement && overlay.remove();
      this.stopKeepSkip(videoElm);
      return;
    }

    overlay.style.height = `${videoElm.clientHeight || 0}px`;
    !overlay.parentElement && videoElm.parentElement?.appendChild(overlay);

    if (skipMode === SkipMode.auto) {
      this.startKeepSkip(videoElm, skipMode);
    } else if (skipMode === SkipMode.manual) {
      if (!overlay.onclick) {
        overlay.onclick = () => {
          this.startKeepSkip(videoElm, SkipMode.auto);
          overlay.onclick = null;
        };
      }
    }
  }

  startWatching(skipMode: SkipMode = SkipMode.auto): void {
    if (skipMode === SkipMode.none) return;

    // 初期化
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(`.${this.selectorOverlay}`)).forEach((e) => e.remove());
    (Array.from(document.querySelectorAll(Netflix.SELECTOR_VIDEO)) as HTMLMediaElement[]).forEach((v) => {
      this.stopKeepSkip(v);
      const guardTimer = this.audioRestoreGuardByVideo.get(v);
      if (guardTimer) {
        clearInterval(guardTimer);
        this.audioRestoreGuardByVideo.delete(v);
      }
      this.originalAudioState.delete(v);
    });
    this.syncScheduled = false;

    this.observer = new MutationObserver((mutations) => {
      if (!this.isRelevantMutation(mutations)) return;
      this.scheduleSync(skipMode);
    });

    this.scheduleSync(skipMode);

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'data-uia'],
    });
  }
}