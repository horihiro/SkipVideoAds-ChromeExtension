import { Vod } from '../vod';

export class AmazonPrimeVideo extends Vod {
  startWatching(): void {
    // const bodyObserver = new MutationObserver(() => {
    //   const adsElms = document.querySelectorAll('.atvwebplayersdk-ad-timer-countdown');
    //   if (adsElms.length <= 0) return;
    //   console.debug('Ad countdown element found:', adsElms);
    //   // bodyObserver.disconnect();
    //   const adsObserver = new MutationObserver(() => {
  
    //     const remainingTime = document.querySelector('.atvwebplayersdk-ad-timer-remaining-time');
    //     if (!remainingTime || !remainingTime.checkVisibility()) return;
    //     const time = remainingTime.textContent;
    //     if (!time) return;
    //     console.debug('Ad remaining time:', time);
    //     const minAndSec = time.split(':').map((t) => parseInt(t));
  
    //     const videoElm:HTMLMediaElement = document.querySelector('video[src^="blob:"]');
          
    //     if (!videoElm) return;
    //     super.skipVideo(videoElm, minAndSec[0] * 60 + minAndSec[1] - 0.1);
    //   });
    //   adsElms.forEach((adsElm) => {
    //     adsObserver.disconnect();
    //     adsObserver.observe(adsElm, {
    //       childList: true,
    //       subtree: true,
    //     });
    //   });
    // });
    const bodyObserver = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll('video[src^="blob:"]')) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        if (e.target.duration - e.target.currentTime <= this.TIMEGAP) return;
        const remainingTime = document.querySelector('.atvwebplayersdk-ad-timer-remaining-time');
        if (!remainingTime || !remainingTime.checkVisibility()) return;

        const time = remainingTime.textContent;
        if (!time) return;
        console.debug('Ad remaining time:', time);
        const minAndSec = time.split(':').map((t) => parseInt(t));
  
        super.skipVideo(videoElm, minAndSec[0] * 60 + minAndSec[1] - 0.1);
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
