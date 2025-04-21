import { Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { TVer } from './vods/tver';
import { YouTube } from './vods/youtube';
import { AbemaTV } from './vods/abema_tv';

(() => {
  const vod:Vod = (() => {
    const hostname = window.location.hostname;
    switch (true) {
      case /amazon\.(com|co\.jp)$/.test(hostname):
        return new AmazonPrimeVideo();
      case /tver\.jp$/.test(hostname):
        return new TVer();
      case /youtube\.com$/.test(hostname):
        return new YouTube();
      case /abema\.tv$/.test(hostname):
        return new AbemaTV();
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