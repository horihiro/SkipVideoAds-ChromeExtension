import { Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { IMASdk } from './vods/ima_sdk';

(() => {
  const vod:Vod = (() => {
    const href = window.location.href;
    switch (true) {
      case /amazon\.(com|co\.jp)\//.test(href):
        return new AmazonPrimeVideo();
      case /youtube\.com/.test(href):
        return new YouTube();
      case window["ima"]:
          return new IMASdk();
      default:
        return null;
    }
  })();
  if (!vod) {
    console.error('No VOD found for this page');
    return;
  }
  vod.startWatching();
})();