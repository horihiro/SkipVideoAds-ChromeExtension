import { Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { TVer } from './vods/tver';

(() => {
  const vod:Vod = (() => {
    const hostname = window.location.hostname;
    if (/amazon\.(com|co\.jp)$/.test(hostname)) {
      return new AmazonPrimeVideo();
    } else if (/tver\.jp$/.test(hostname)) {
      return new TVer();
    }      
    return null;
  })();
  if (!vod) {
    console.error('No VOD found for this page');
    return;
  }
  vod.startWatching();
})();