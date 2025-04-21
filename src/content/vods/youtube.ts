import { Vod } from "../vod";
export class YouTube extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll('video.video-stream.html5-main-video')) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        if (document.querySelectorAll('.video-ads')[0].childNodes.length <= 0) return;
        const video = (e.target as HTMLMediaElement);
        const skipTime = video.duration - video.currentTime;
        if (skipTime <= 0) return;
        videoElm.ontimeupdate = null;
        super.skipVideo(e.target as HTMLMediaElement, skipTime);
        videoElm.ontimeupdate = ontimeupdate;
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