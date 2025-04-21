import { Vod } from "../vod";
export class IMASdk extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElms: HTMLMediaElement[] = (Array.from(document.querySelectorAll('video[title="Advertisement"]')) as HTMLMediaElement[]).filter(e => !e.onplay);
      if (videoElms.length === 0) return;
      videoElms.forEach(videoElm => {
        videoElm.onplay = async (e) => {
          const video = (e.target as HTMLMediaElement);
          // const currentDisplayStyle = video.style.display;
          video.style.display = 'none';
          const skipTime = video.duration - video.currentTime;
          if (skipTime <= 0) return;
          super.skipVideo(e.target as HTMLMediaElement, skipTime);
          // video.style.display = currentDisplayStyle;
        };
      });
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

  }
}