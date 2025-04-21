import { Vod } from "../vod";
export class IMASdk extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElms: HTMLMediaElement[] = (Array.from(document.querySelectorAll('video[title="Advertisement"]')) as HTMLMediaElement[]).filter(e => !e.ontimeupdate);
      if (videoElms.length === 0) return;
      videoElms.forEach(videoElm => {
        const ontimeupdate = (e) => {
          if (e.target.duration - e.target.currentTime <= this.TIMEGAP) return;
          const video = (e.target as HTMLMediaElement);
          const skipTime = video.duration - video.currentTime;
          if (skipTime <= 0) return;
          super.skipVideo(e.target as HTMLMediaElement, skipTime);
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