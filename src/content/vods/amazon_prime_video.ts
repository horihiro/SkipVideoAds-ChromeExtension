import { sleepAsync } from '../../utils/timer';
import { SkipMode, Vod } from '../vod';

export class AmazonPrimeVideo extends Vod {
  protected static SELECTOR_VIDEO: string = 'video[src^="blob:"]' as const;
  protected static SELECTOR_COUNTDOWN: string = '.atvwebplayersdk-ad-timer-remaining-time' as const;

  static isAvailable(): boolean {
    return /amazon\.(com|co\.jp)\//.test(location.href);
  }

  static injection(): boolean {
    return true;
  }

  seekToEnd(videoElm: HTMLMediaElement) {
    const remainingTime = document.querySelector(AmazonPrimeVideo.SELECTOR_COUNTDOWN);
    if (!remainingTime) return;
    const time = remainingTime.textContent.replace(/.*(\d{1,2}:\d{2}).*/g, '$1');
    if (!time || time === '0:00') return;
    const minAndSec = time.split(':').map((t) => parseInt(t));
    if (minAndSec.length !== 2 || minAndSec.some(isNaN) || minAndSec[0] * 60 + minAndSec[1] < 1 + this.TIMEGAP) return;
    this.skipVideo(videoElm, minAndSec[0] * 60 + minAndSec[1] - 1);
  }

  startWatching(skipMode: SkipMode = 'auto'): void {
    if (skipMode === SkipMode.none) return;
    // initialization
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(this.selectorOverlay)).forEach(e => e.remove());
    (Array.from(document.querySelectorAll(AmazonPrimeVideo.SELECTOR_VIDEO)) as HTMLMediaElement[]).forEach(v => v.ontimeupdate = null);

    this.observer = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll(AmazonPrimeVideo.SELECTOR_VIDEO)) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        const remainingTime = document.querySelector(AmazonPrimeVideo.SELECTOR_COUNTDOWN);
        const overlay = this.getOverlay(skipMode);
        if (!remainingTime || !remainingTime.checkVisibility() || videoElm.style.visibility === 'hidden'
          || isNaN(videoElm.duration) || isNaN(videoElm.currentTime) || videoElm.currentTime <= 0 || videoElm.duration <= 0) {
          overlay.parentElement && overlay.remove();
          return;
        }

        !overlay.parentElement && videoElm.closest('.webPlayerSDKContainer, [id^="dv-web-player"]>*')?.appendChild(overlay);

        if (skipMode === SkipMode.auto) {
          await sleepAsync(100);
          this.seekToEnd(videoElm);
        } else if (skipMode === SkipMode.manual) {
          const clickTarget = overlay;
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
