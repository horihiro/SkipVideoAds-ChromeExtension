import { Vod } from "../vod";
export class YouTube extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll('video.video-stream.html5-main-video')) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = (e) => {
        const video = (e.target as HTMLMediaElement);
        if (isNaN(video.duration) || isNaN(video.currentTime) || video.currentTime <= 0 || video.duration <= 0) return;
        if (document.querySelectorAll('.video-ads')[0].childNodes.length <= 0 || videoElm.style.visibility === 'hidden') {
          videoElm.style.visibility = '';
          return;
        }
        videoElm.style.visibility = 'hidden';
        const skipTime = video.duration - video.currentTime;
        if (skipTime <= 0) return;
        this.skipVideo(e.target as HTMLMediaElement, skipTime);
      };
      videoElm.ontimeupdate = ontimeupdate;
      // bodyObserver.disconnect();
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}