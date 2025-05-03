// Supported Video Platforms:
// - https://www.dailymotion.com/
// - https://tver.jp/
// - https://abema.tv/
// - https://cu.ntv.co.jp/
// - https://cu.tbs.co.jp/
// - https://fod.fujitv.co.jp/

import { SkipMode, Vod } from "../vod";
export class IMASdk extends Vod {
  protected static SELECTOR_VIDEO_VJS: string = 'video[id^="vjs_video_"][id$="_html5_api"]' as const;
  protected static SELECTOR_VIDEO_AD: string = 'video[title="Advertisement"], video[src^="https://"]' as const;
  protected static SELECTOR_IMA_SDK: string = 'script[src$="ima3.js"]' as const;

  static isAvailable(): boolean {
    return !!document.querySelector(IMASdk.SELECTOR_IMA_SDK)
        || !!document.querySelector(IMASdk.SELECTOR_VIDEO_AD)
        || !!document.querySelector(IMASdk.SELECTOR_VIDEO_VJS);
  }

  seekToEnd(videoElm: HTMLMediaElement) {
    if (!videoElm) return;
    if (videoElm.duration - videoElm.currentTime <= this.TIMEGAP * 2) return;
    if (isNaN(videoElm.duration) || isNaN(videoElm.currentTime) || videoElm.currentTime <= 0 || videoElm.duration <= 0) return;
    const skipTime = videoElm.duration - videoElm.currentTime;
    if (skipTime <= 0) return;
    this.skipVideo(videoElm as HTMLMediaElement, skipTime);
  }
  startWatching(skipMode: SkipMode = SkipMode.auto): void {
    if (skipMode === SkipMode.none) return;

    // initialization
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(this.selectorOverlay)).forEach(e => e.remove());
    (Array.from(document.querySelectorAll(IMASdk.SELECTOR_VIDEO_AD)) as HTMLMediaElement[]).forEach(v => v.ontimeupdate = null);

    this.observer = new MutationObserver(() => {
      const adVideoElms: HTMLMediaElement[] = (Array.from(document.querySelectorAll(IMASdk.SELECTOR_VIDEO_AD)) as HTMLMediaElement[])
        .filter(v => {
          return (v.parentElement?.lastChild as HTMLElement).className !== this.selectorOverlay;
        });
      if (adVideoElms.length === 0) return;
      if (skipMode === SkipMode.auto) {
        adVideoElms.forEach(videoElm => {
          const overlay = this.getOverlay(skipMode).cloneNode(true) as HTMLDivElement;
          videoElm.parentElement?.appendChild(overlay);
          videoElm.ontimeupdate = (e) => {
            this.seekToEnd(e.target as HTMLMediaElement);
          };
        });
      } else if (skipMode === SkipMode.manual) {
        adVideoElms.forEach(videoElm => {
          const overlay = this.getOverlay(skipMode).cloneNode(true) as HTMLDivElement;
          videoElm.parentElement?.appendChild(overlay);
        });
        const clickTarget = Array(6).fill(0).reduce((e) => {
          return e.parentElement || e;
        }, document.querySelector('iframe[id^="goog_"]'));
        clickTarget.onclick = (e) => {
          this.seekToEnd((Array.from(document.querySelectorAll(IMASdk.SELECTOR_VIDEO_AD)) as HTMLMediaElement[]).find(v => !v.ended));
        };
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

  }
}