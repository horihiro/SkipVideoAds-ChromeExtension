import { SkipMode, Vod } from "../vod";
export class YouTube extends Vod {
  protected selectorVideo: string = 'video.video-stream.html5-main-video' as const;
  seekToEnd(videoElm: HTMLMediaElement) {
    const skipTime = videoElm.duration - videoElm.currentTime;
    if (skipTime <= 0) return;
    this.skipVideo(videoElm, skipTime);
  }
  startWatching(skipMode: SkipMode = SkipMode.auto): void {
    // initialization
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(this.selectorOverlay)).forEach(e => e.remove());
    (Array.from(document.querySelectorAll(this.selectorVideo)) as HTMLMediaElement[]).forEach(v => v.ontimeupdate = null);

    this.observer = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll(this.selectorVideo)) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        if (document.querySelectorAll('.ytp-ad-player-overlay-layout').length < 1) {
          this.overlay.parentElement && this.overlay.remove();
          return;
        }
        const video = (e.target as HTMLMediaElement);
        if (isNaN(video.duration) || isNaN(video.currentTime) || video.currentTime <= 0 || video.duration <= 0) return;

        this.overlay.style.height = videoElm.style.height;
        videoElm.parentElement?.appendChild(this.overlay);
        if (skipMode === SkipMode.auto) {
          this.seekToEnd(videoElm);
        } else if (skipMode === SkipMode.manual) {
          const clickTarget = this.overlay;
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