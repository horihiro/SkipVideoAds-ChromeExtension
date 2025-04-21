import { Vod } from "../vod";
export class TVer extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElms: HTMLMediaElement[] = (Array.from(document.querySelectorAll('video[title="Advertisement"]')) as HTMLMediaElement[]).filter(e => !e.onplay);
      if (videoElms.length === 0) return;
      videoElms.forEach(videoElm => {
        videoElm.onloadedmetadata = function(e) {
          (e.target as HTMLMediaElement).setAttribute('dutation', (e.target as HTMLMediaElement).duration.toString());
        };
        videoElm.onplay = async (e) => {
          const video = (e.target as HTMLMediaElement);
          const skipTime = Number(video.getAttribute('dutation')) - Number(video.currentTime);
          if (skipTime <= 0) return;
          super.skipVideo(e.target as HTMLMediaElement, skipTime);
          video.removeAttribute('dutation');
        };
      });
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

  }
}