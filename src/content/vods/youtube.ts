import { SkipMode, Vod } from "../vod";
export class YouTube extends Vod {
  protected static SELECTOR_VIDEO: string = 'video.video-stream.html5-main-video' as const;

  static isAvailable(): boolean {
    return /youtube\.com/.test(location.href);
  }

  static injection(): boolean {
    // To set IsTrusted to true
    const deepCopy = (src) => {
      let target = src;
      let dst = {};
      while (true) {
        try {
          dst = Object.assign(dst, Object.getOwnPropertyNames(target)
            .reduce((p, k) => {
              try {
                p[k] = (typeof src[k] !== 'function') ? src[k] : function (...args) {
                  const result = src[k].apply(src, args);
                  if (result && typeof result === 'object') {
                    return deepCopy(result);
                  }
                  return result;
                }
              } catch { }
              return p;
            }, dst));
          target = target.__proto__;
        } catch (e) {
          break;
        }
      }
      return dst;
    }
    Element.prototype["_addEventListener"] = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function () {
      const args = [...arguments];
      const temp = args[1];
      args[1] = function () {
        const args2 = [...arguments];
        const clone = deepCopy(args2[0])
        clone['isTrusted'] = true;
        clone['preventDefault'] = function () {}; 
        args2[0] = clone
        return temp(...args2);
      }
      return this._addEventListener(...args);
    }
    return true;
  }

  seekToEnd(videoElm: HTMLMediaElement) {
    const skipTime = videoElm.duration - videoElm.currentTime;
    if (skipTime <= 0) return;
    this.skipVideo(videoElm, skipTime);
  }
  startWatching(skipMode: SkipMode = SkipMode.auto): void {
    if (skipMode === SkipMode.none) return;

    // initialization
    this.observer && this.observer.disconnect();
    Array.from(document.querySelectorAll(this.selectorOverlay)).forEach(e => e.remove());
    (Array.from(document.querySelectorAll(YouTube.SELECTOR_VIDEO)) as HTMLMediaElement[]).forEach(v => v.ontimeupdate = null);

    this.observer = new MutationObserver(() => {
      const videoElm: HTMLMediaElement = (Array.from(document.querySelectorAll(YouTube.SELECTOR_VIDEO)) as HTMLMediaElement[]).find(v => !v.ontimeupdate);
      if (!videoElm) return;
      const ontimeupdate = async (e) => {
        const overlay = this.getOverlay(skipMode);
        if (document.querySelectorAll('.ytp-ad-player-overlay-layout').length < 1) {
          overlay.parentElement && overlay.remove();
          return;
        }
        const skipButton = document.querySelector('.ytp-skip-ad-button__text') as HTMLElement
        if (skipButton) {
          console.debug('Skip button found');
          skipButton.click();
        }
        const video = (e.target as HTMLMediaElement);
        if (isNaN(video.duration) || isNaN(video.currentTime) || video.currentTime <= 0 || video.duration <= 0) {return};

        overlay.style.height = videoElm.style.height;
        videoElm.parentElement?.appendChild(overlay);
        if (skipMode === SkipMode.auto) {
          this.seekToEnd(videoElm);
        } else if (skipMode === SkipMode.manual) {
          const clickTarget = overlay;
          if (!clickTarget.onclick) {
            clickTarget.onclick = () => {
              this.seekToEnd(video);
              clickTarget.onclick = null;
            }
          }
        }
      };
      videoElm.ontimeupdate = ontimeupdate;
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}