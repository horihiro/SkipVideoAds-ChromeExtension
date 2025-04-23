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
        const video = (e.target as HTMLMediaElement);
        if (isNaN(video.duration) || isNaN(video.currentTime) || video.currentTime <= 0 || video.duration <= 0) return;

        // const button: HTMLDivElement = document.querySelector('div.ytp-skip-ad') as HTMLDivElement;
        // if (button) {
        //   console.debug('button', button.checkVisibility(), button.parentElement.outerHTML);
        //   await new Promise(resolve => setTimeout(resolve, 1000));
        //   button.dispatchEvent(new MouseEvent('click'));          // return;
        // }
        this.overlay.style.height = videoElm.style.height;
        videoElm.parentElement?.appendChild(this.overlay);
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