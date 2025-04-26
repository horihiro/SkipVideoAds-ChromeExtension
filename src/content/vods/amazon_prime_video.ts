import { Vod } from '../vod';

export class AmazonPrimeVideo extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll('video[src^="blob:"]')) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        const remainingTime = document.querySelector('.atvwebplayersdk-ad-timer-remaining-time');
        if (!remainingTime || !remainingTime.checkVisibility() || videoElm.style.visibility === 'hidden') {
          this.overlay.remove();
          return;
        }

        !this.overlay.parentElement && videoElm.closest('.webPlayerSDKContainer').appendChild(this.overlay);

        if (this.skipMode === 'auto') {
          const time = remainingTime.textContent;
          if (!time || time === '0:00') return;
          const minAndSec = time.split(':').map((t) => parseInt(t));
          this.skipVideo(videoElm, minAndSec[0] * 60 + minAndSec[1] - 0.5);
        } else if (this.skipMode === 'manual') {
          const clickTarget = this.overlay;
          if (!clickTarget.onclick) {
            clickTarget.onclick = () => {
              const time = remainingTime.textContent;
              if (!time || time === '0:00') return;
              const minAndSec = time.split(':').map((t) => parseInt(t));
              this.skipVideo(videoElm, minAndSec[0] * 60 + minAndSec[1] - 0.5);
              clickTarget.onclick = null;
            }
            console.log((document.querySelector('#dv-web-player') as HTMLElement).onclick)
          }
        }
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
