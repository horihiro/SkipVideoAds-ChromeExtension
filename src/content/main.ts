import { Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { IMASdk } from './vods/ima_sdk';

(() => {
  window.addEventListener('load', async () => {
    const vod: Vod = ((href) => {
      switch (true) {
        case /amazon\.(com|co\.jp)\//.test(href):
          console.debug('Amazon Prime Video detected');
          return new AmazonPrimeVideo();
        case /youtube\.com/.test(href):
          console.debug('YouTube detected');
          return new YouTube();
        default:
          const imaSelector = 'script[src$="ima3.js"]';
          if (document.querySelector(imaSelector)) {
            console.debug('IMA SDK detected');
            return new IMASdk();
          }
          const observer = new MutationObserver(() => {
            if (!document.querySelector(imaSelector)) return;

            observer.disconnect();
            console.debug('IMA SDK detected');
            const vod = new IMASdk();
            vod.startWatching();
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
          console.warn('Observing for IMA SDK...');
          return null;
      }
    })(window.location.href);
    if (!vod) return;

    vod.startWatching();
  });
})();