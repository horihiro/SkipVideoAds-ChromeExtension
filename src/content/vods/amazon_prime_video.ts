import { SkipMode, Vod } from '../vod';

export class AmazonPrimeVideo extends Vod {
  protected selectorVideo: string = 'video[src^="blob:"]' as const;

  seekToEnd(videoElm: HTMLMediaElement) {
    const remainingTime = document.querySelector('.atvwebplayersdk-ad-timer-remaining-time');
    const time = remainingTime.textContent;
    if (!time || time === '0:00') return;
    const minAndSec = time.split(':').map((t) => parseInt(t));
    this.skipVideo(videoElm, minAndSec[0] * 60 + minAndSec[1] - 0.5);
}

  startWatching(skipMode: SkipMode = 'auto'): void {
    // initialization
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(this.selectorOverlay)).forEach(e => e.remove());
    (Array.from(document.querySelectorAll(this.selectorVideo)) as HTMLMediaElement[]).forEach(v => v.ontimeupdate = null);

    this.observer = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll(this.selectorVideo)) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        const remainingTime = document.querySelector('.atvwebplayersdk-ad-timer-remaining-time');
        if (!remainingTime || !remainingTime.checkVisibility() || videoElm.style.visibility === 'hidden') {
          this.overlay.parentElement && this.overlay.remove();
          return;
        }

        !this.overlay.parentElement && videoElm.closest('.webPlayerSDKContainer').appendChild(this.overlay);

        if (skipMode === SkipMode.auto) {
          this.seekToEnd(videoElm);
        } else if (skipMode === SkipMode.manual) {
          const clickTarget = this.overlay;
          if (!clickTarget.onclick) {
            clickTarget.onclick = () => {
              this.seekToEnd(videoElm);
              clickTarget.onclick = null;
            }
          }
        }
      };
      videoElm.ontimeupdate = ontimeupdate;
      // bodyObserver.disconnect();
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
