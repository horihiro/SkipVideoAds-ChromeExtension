import { Vod } from "../vod";
export class IMASdk extends Vod {
  constructor () {
    super();
    this.TIMEGAP = 0.1;
  }
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElms: HTMLMediaElement[] = (Array.from(document.querySelectorAll('video[title="Advertisement"]')) as HTMLMediaElement[]).filter(e => !e.ontimeupdate);
      if (videoElms.length === 0) return;
      videoElms.forEach(videoElm => {
        videoElm.parentElement?.appendChild(this.overlay.cloneNode(true) as HTMLDivElement);
        const ontimeupdate = (e) => {
          if (e.target.duration - e.target.currentTime <= this.TIMEGAP*2) return;
          const video = (e.target as HTMLMediaElement);
          if (isNaN(video.duration) || isNaN(video.currentTime) || video.currentTime <= 0 || video.duration <= 0) return;
          const skipTime = video.duration - video.currentTime;
          if (skipTime <= 0) return;
          this.skipVideo(e.target as HTMLMediaElement, skipTime);
        };
        videoElm.ontimeupdate = ontimeupdate;
      });
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

  }
}