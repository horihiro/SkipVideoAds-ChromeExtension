import { Vod } from "../vod";
export class IMASdk extends Vod {
  constructor() {
    super();
    this.TIMEGAP = 0.1;
  }
  seekToEnd(videoElm: HTMLMediaElement) {
    if (!videoElm) return;
    if (videoElm.duration - videoElm.currentTime <= this.TIMEGAP * 2) return;
    if (isNaN(videoElm.duration) || isNaN(videoElm.currentTime) || videoElm.currentTime <= 0 || videoElm.duration <= 0) return;
    const skipTime = videoElm.duration - videoElm.currentTime;
    if (skipTime <= 0) return;
    this.skipVideo(videoElm as HTMLMediaElement, skipTime);
  }
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const adVideoElms: HTMLMediaElement[] = (Array.from(document.querySelectorAll('video[title="Advertisement"]')) as HTMLMediaElement[])
      .filter(v => {
        return (v.parentElement?.lastChild as HTMLElement).className !== this.overlay.className;
      });
      if (adVideoElms.length === 0) return;
      if (this.skipMode === 'auto') {
        adVideoElms.forEach(videoElm => {
          const overlay = this.overlay.cloneNode(true) as HTMLDivElement;
          videoElm.parentElement?.appendChild(overlay);
          videoElm.ontimeupdate = (e) => {
            this.seekToEnd(e.target as HTMLMediaElement);
          };
        });
      } else if (this.skipMode === 'manual') {
        adVideoElms.forEach(videoElm => {
          const overlay = this.overlay.cloneNode(true) as HTMLDivElement;
          videoElm.parentElement?.appendChild(overlay);
        });
        const clickTarget = Array(6).fill(0).reduce((e) => {
          return e.parentElement || e;
        }, document.querySelector('iframe[id^="goog_"]'));
        clickTarget.onclick = (e) => {
            this.seekToEnd((Array.from(document.querySelectorAll('video[title="Advertisement"]')) as HTMLMediaElement[]).find(v => !v.ended));
        };
      }
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

  }
}