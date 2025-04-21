import { Vod } from "../vod";
export class YouTube extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll('video.video-stream.html5-main-video')) as HTMLMediaElement[]).find(v => !v.onplaying);
      if (!videoElm) return;
      videoElm.onplaying = async (e) => {
        if (document.querySelectorAll('.video-ads')[0].childNodes.length <= 0) return;
        const video = (e.target as HTMLMediaElement);
        console.debug('video', video);
        console.debug('currentTime', video.currentTime);
        console.debug('duration', video.duration);
        const skipTime = video.duration- video.currentTime;
        console.debug('skipTime', skipTime);
        if (skipTime <= 0) return;
        super.skipVideo(e.target as HTMLMediaElement, skipTime);
      };
      // bodyObserver.disconnect();
  });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}