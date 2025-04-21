import { Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { IMASdk } from './vods/ima_sdk';

(() => {
  window.addEventListener('load', async () => {
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const vod: Vod = (() => {
        const href =  window.location.href;
        switch (true) {
          case /amazon\.(com|co\.jp)\//.test(href):
            console.debug('Amazon Prime Video detected');
            return new AmazonPrimeVideo();
          case /youtube\.com/.test(href):
            console.debug('YouTube detected');
            return new YouTube();
          default:
            return new IMASdk();
        }
      })();
      if (vod) {
        vod.startWatching();
        break;
      }
      console.debug('Waiting for VOD to be detected...');
    }
  });
})();