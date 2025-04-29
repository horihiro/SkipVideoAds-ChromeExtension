import { SkipMode, Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { IMASdk } from './vods/ima_sdk';
import { minimatch } from 'minimatch';

(() => {
  const DEFAULT_SKIP_MODE: SkipMode = SkipMode.auto;
  const DEFAULT_SKIP_RULE = { priority: Number.MAX_SAFE_INTEGER, pattern: 'https://*/**', skipMode: DEFAULT_SKIP_MODE };

  const loadSkipMode = async (href: string): Promise<SkipMode> => {
    const skipRules = (await chrome.storage.local.get(['skipRules'])).skipRules;
    if (!skipRules || skipRules.length === 0) {
      await chrome.storage.local.set({ 'skipRules': [DEFAULT_SKIP_RULE] });
      return DEFAULT_SKIP_MODE;
    }
    const skipMode = skipRules.sort((r1, r2) => r1.priority > r2.priority ? 1 : -1).reduce((prev, skipRule) => {
      return prev || (minimatch(href, skipRule.pattern) ? skipRule.skipMode : null);
    }, null);
    console.debug('skipMode:', skipMode);
    return skipMode || DEFAULT_SKIP_MODE;
  };

  window.addEventListener('load', async () => {
    let vod: Vod = null;
    chrome.storage.onChanged.addListener(async (_, area) => {
      if (area !== 'local') return;

      const skipMode = await loadSkipMode(location.href);
      if (skipMode === SkipMode.none) return;
      vod.startWatching(skipMode || DEFAULT_SKIP_MODE);
    });

    let observer: MutationObserver | null = null;
    const init = (href) => {
      switch (true) {
        case AmazonPrimeVideo.isAvailable():
          console.debug('Amazon Prime Video detected');
          return new AmazonPrimeVideo();
        case YouTube.isAvailable():
          console.debug('YouTube detected');
          return new YouTube();
        case IMASdk.isAvailable():
          console.debug('IMA SDK detected');
          return new IMASdk();
        default:
          observer && observer.disconnect();
          observer = new MutationObserver(async () => {
            if (!IMASdk.isAvailable()) return;

            observer.disconnect();
            console.debug('IMA SDK detected');
            vod = new IMASdk();
            const skipMode = await loadSkipMode(location.href);
            vod.startWatching(skipMode || DEFAULT_SKIP_MODE);
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
          console.debug('Observing for IMA SDK...');
          return null;
      }
    };
    vod = init(location.href);
    if (!vod) return;

    const skipMode = await loadSkipMode(location.href);
    vod.startWatching(skipMode || DEFAULT_SKIP_MODE);
  });
})();