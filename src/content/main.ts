import { SkipMode, Vod } from './vod';
import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { IMASdk } from './vods/ima_sdk';
import { minimatch } from 'minimatch';

(() => {
  const VOD_CLASSES = [
    AmazonPrimeVideo,
    YouTube,
    IMASdk,
  ];
  const DEFAULT_SKIP_MODE: SkipMode = SkipMode.auto;
  const DEFAULT_SKIP_RULE = { priority: Number.MAX_SAFE_INTEGER, pattern: 'https://*/**', skipMode: DEFAULT_SKIP_MODE };
  const TIMEOUT_OBSERVE_IMASDK = 10000;

  const loadSkipMode = async (href: string): Promise<SkipMode> => {
    const skipRules = (await chrome.storage.local.get(['skipRules'])).skipRules;
    if (!skipRules || skipRules.length === 0) {
      await chrome.storage.local.set({ 'skipRules': [DEFAULT_SKIP_RULE] });
      return DEFAULT_SKIP_RULE.skipMode;
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
      if (skipMode === SkipMode.none || !vod) return;
      vod.startWatching(skipMode || DEFAULT_SKIP_MODE);
    });

    let observer: MutationObserver | null = null;
    const init = async () => {
      const vodClass = VOD_CLASSES.find((vodClass) => {
        if (vodClass.isAvailable()) {
          console.debug(`${vodClass.name} detected`);
          vod = new vodClass();
          return true;
        }
        return false;
      });
      if (vodClass) {
        vod = new vodClass();
        return vod;
      }
      observer && observer.disconnect();
      observer = new MutationObserver(async () => {
        if (!IMASdk.isAvailable()) return;

        observer.disconnect();
        observer = null;
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
      setTimeout(() => {
        if (!observer) return;

        observer.disconnect();
        console.debug('Stopped observing for IMA SDK');
      }, await (async () => {
        const { timeout } = await chrome.storage.local.get(['timeout']);
        if (timeout && !isNaN(timeout)) return timeout;

        await chrome.storage.local.set({ 'timeout': TIMEOUT_OBSERVE_IMASDK });
        return TIMEOUT_OBSERVE_IMASDK;
      })()
      );
      return null;
    };
    vod = await init();
    if (!vod) return;

    const skipMode = await loadSkipMode(location.href);
    vod.startWatching(skipMode || DEFAULT_SKIP_MODE);
  });
})();