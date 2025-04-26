import { Vod } from "../vod";
export class YouTube extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll('video.video-stream.html5-main-video')) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        if (document.querySelectorAll('.video-ads').length <= 0 || document.querySelectorAll('.video-ads')[0].childNodes.length <= 0) {
          this.overlay.parentNode && this.overlay.remove();
          return;
        }
        videoElm.closest('.ytd-player')?.appendChild(this.overlay);
        (document.querySelector('.ytp-next-button') as HTMLElement)?.click();
      };
      videoElm.ontimeupdate = ontimeupdate;
    });
    this.skipMode === 'auto' && bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}