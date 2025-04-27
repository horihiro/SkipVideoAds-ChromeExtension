import { SkipMode, Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { IMASdk } from './vods/ima_sdk';

(() => {
  const defaultSkipMode:SkipMode = SkipMode.auto;

  window.addEventListener('load', async () => {
    let observer: MutationObserver | null = null;
    const init = (href) => {
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
          observer && observer.disconnect();
          observer = new MutationObserver(async () => {
            if (!document.querySelector(imaSelector)) return;

            observer.disconnect();
            console.debug('IMA SDK detected');
            const vod = new IMASdk();
            const { skipMode } = (await chrome.storage.local.get(['skipMode']));
            vod.startWatching(skipMode || defaultSkipMode);
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
          console.debug('Observing for IMA SDK...');
          return null;
      }
    };
    const vod: Vod = init(location.href);
    if (!vod) return;

    const { skipMode } = (await chrome.storage.local.get(['skipMode']));
    vod.startWatching(skipMode || defaultSkipMode);

    chrome.storage.onChanged.addListener(async (changes, area) => {
      if (area !== 'local') return;

      const { skipMode } = (await chrome.storage.local.get(['skipMode']));
      vod.startWatching(skipMode || defaultSkipMode);
    });
  });
})();