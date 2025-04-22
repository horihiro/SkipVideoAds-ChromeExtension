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
        // videoElm.style.visibility = 'hidden';
        const telop = document.createElement('div');
        telop.style.position = 'absolute';
        telop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        telop.style.top = '0';
        telop.style.left = '0';
        telop.style.width = '100%';
        telop.style.height = '100%';
        telop.style.lineHeight = '50';
        telop.style.textAlign = 'center';
        telop.textContent = 'Skiping Ads...';
        videoElm.parentElement?.appendChild(telop);
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