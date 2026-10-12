import { sleepAsync } from '../../utils/timer';
import { SkipMode, Vod } from '../vod';

export class AmazonPrimeVideo extends Vod {
  protected static SELECTOR_VIDEO: string = 'video[src^="blob:"]' as const;
  protected static SELECTOR_COUNTDOWN: string = '.atvwebplayersdk-ad-timer-remaining-time' as const;

  // Set the vidoe playback rate x16 during ad countdown
  protected static PLAYBACK_RATE_DURING_AD: number = 16;
  protected originalPlaybackRate: number = -1;
  protected originalVolume: number = 0;


  static isAvailable(): boolean {
    return /amazon\.(com|co\.jp)\//.test(location.href);
  }

  static injection(): boolean {
    return true;
  }

  static getVODName(): string {
    return 'Amazon Prime Video';
  }

  startWatching(skipMode: SkipMode = 'auto'): void {
    if (skipMode === SkipMode.none) return;
    // initialization
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(this.selectorOverlay)).forEach(e => e.remove());
    (Array.from(document.querySelectorAll(AmazonPrimeVideo.SELECTOR_VIDEO)) as HTMLMediaElement[]).forEach(v => v.ontimeupdate = null);

    this.observer = new MutationObserver(() => {
      const videoElm: HTMLMediaElement | undefined = (Array.from(document.querySelectorAll(AmazonPrimeVideo.SELECTOR_VIDEO)) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async () => {
        const remainingTime = document.querySelector(AmazonPrimeVideo.SELECTOR_COUNTDOWN);
        const overlay = this.getOverlay(skipMode);
        if (!remainingTime || !remainingTime.checkVisibility() || videoElm.style.visibility === 'hidden'
          || isNaN(videoElm.duration) || isNaN(videoElm.currentTime) || videoElm.currentTime <= 0 || videoElm.duration <= 0) {
          overlay.parentElement && overlay.remove();
          if (this.originalPlaybackRate > 0) {
            videoElm.playbackRate = this.originalPlaybackRate;
            this.originalPlaybackRate = -1;
          }
          if (this.originalVolume > 0) {
            videoElm.volume = this.originalVolume;
            this.originalVolume = 0;
          }
          return;
        }

        !overlay.parentElement && videoElm.closest('.webPlayerSDKContainer, [id^="dv-web-player"]>*')?.appendChild(overlay);

        if (skipMode === SkipMode.auto) {
          await sleepAsync(100);
          if (this.originalPlaybackRate < 0) this.originalPlaybackRate = videoElm.playbackRate;
          videoElm.playbackRate = AmazonPrimeVideo.PLAYBACK_RATE_DURING_AD;
          if (this.originalVolume <= 0) this.originalVolume = videoElm.volume;
          videoElm.volume = 0;
        } else if (skipMode === SkipMode.manual) {
          const clickTarget = overlay;
          if (!clickTarget.onclick) {
            clickTarget.onclick = () => {
              if (this.originalPlaybackRate < 0) this.originalPlaybackRate = videoElm.playbackRate;
              videoElm.playbackRate = AmazonPrimeVideo.PLAYBACK_RATE_DURING_AD;
              if (this.originalVolume <= 0) this.originalVolume = videoElm.volume;
              videoElm.volume = 0;
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
