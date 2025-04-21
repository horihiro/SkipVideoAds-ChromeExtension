import { Vod } from '../vod';

export class AmazonPrimeVideo extends Vod {
  startWatching(): void {
    const bodyObserver = new MutationObserver(() => {
      const adsElm = document.querySelector('.atvwebplayersdk-ad-timer-countdown');
      if (!adsElm) return;
      console.debug('Ad countdown element found:', adsElm);
      bodyObserver.disconnect();
      const adsObserver = new MutationObserver(() => {
  
        const remainingTime = adsElm.querySelector('.atvwebplayersdk-ad-timer-remaining-time');
        if (!remainingTime) return;
        const time = remainingTime.textContent;
        if (!time) return;
        console.debug('Ad remaining time:', time);
        const minAndSec = time.split(':').map((t) => parseInt(t));
  
        const videoElm:HTMLMediaElement = document.querySelector('video[src^="blob:"]');
          
        if (!videoElm) return;
        super.skipVideo(videoElm, minAndSec[0] * 60 + minAndSec[1]);
      });
      adsObserver.observe(adsElm, {
        childList: true,
        subtree: true,
      });
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
