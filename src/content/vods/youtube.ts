import { SkipMode, Vod } from "../vod";
export class YouTube extends Vod {
  protected static SELECTOR_VIDEO: string = 'video.video-stream.html5-main-video' as const;

  static isAvailable(): boolean {
    return /youtube\.com/.test(location.href);
  }

  seekToEnd(videoElm: HTMLMediaElement) {
    const skipTime = videoElm.duration - videoElm.currentTime;
    if (skipTime <= 0) return;
    this.skipVideo(videoElm, skipTime);
  }
  startWatching(skipMode: SkipMode = SkipMode.auto): void {
    if (skipMode === SkipMode.none) return;

    // initialization
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(this.selectorOverlay)).forEach(e => e.remove());
    (Array.from(document.querySelectorAll((this.constructor as any).SELECTOR_VIDEO)) as HTMLMediaElement[]).forEach(v => v.ontimeupdate = null);

    this.observer = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll((this.constructor as any).SELECTOR_VIDEO)) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        const overlay = this.getOverlay(skipMode);
        if (document.querySelectorAll('.ytp-ad-player-overlay-layout').length < 1) {
          overlay.parentElement && overlay.remove();
          return;
        }
        const video = (e.target as HTMLMediaElement);
        if (isNaN(video.duration) || isNaN(video.currentTime) || video.currentTime <= 0 || video.duration <= 0) return;

        overlay.style.height = videoElm.style.height;
        videoElm.parentElement?.appendChild(overlay);
        if (skipMode === SkipMode.auto) {
          this.seekToEnd(videoElm);
        } else if (skipMode === SkipMode.manual) {
          const clickTarget = overlay;
          if (!clickTarget.onclick) {
            clickTarget.onclick = () => {
              this.seekToEnd(video);
              clickTarget.onclick = null;
            }
          }
        }
      };
      videoElm.ontimeupdate = ontimeupdate;
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}