export const SkipMode = {
  auto: 'auto',
  manual: 'manual',
} as const;

export type SkipMode = typeof SkipMode[keyof typeof SkipMode];

export class Vod {
  protected TIMEGAP: number;
  private overlayElm: HTMLDivElement;
  protected observer: MutationObserver;
  protected selectorOverlay: string = 'skip-vod-overlay' as const;
  constructor() {
    this.observer = null;
    this.TIMEGAP = 0.1;
    this.overlayElm = document.createElement('div');
    this.overlayElm.className = this.selectorOverlay;
  }
  getOverlay(skipMode: SkipMode = SkipMode.auto): HTMLDivElement {
    this.overlayElm.style.position = 'absolute';
    this.overlayElm.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.overlayElm.style.top = '0';
    this.overlayElm.style.left = '0';
    this.overlayElm.style.width = '100%';
    this.overlayElm.style.height = '100%';
    this.overlayElm.style.color = 'white';
    this.overlayElm.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 50">
  <polygon points="32,18 45,25 32,32" fill="white">
    <animate
      attributeName="opacity"
      values="1;0;1"
      dur="0.5s"
      repeatCount="indefinite" />
  </polygon>
  <polygon points="45,18 58,25 45,32" fill="white">
    <animate
      attributeName="opacity"
      values="0.5;1;0.5;0;0.5"
      dur="0.5s"
      repeatCount="indefinite" />
  </polygon>
  <polygon points="58,18 71,25 58,32" fill="white">
    <animate
      attributeName="opacity"
      values="0;1;0"
      dur="0.5s"
      repeatCount="indefinite" />
  </polygon>
</svg>`
    return this.overlayElm;
  }
  startWatching(skipMode: SkipMode = SkipMode.auto) {
    console.error('Need to implement startWatching');
    throw new Error('Not implemented');
  }

  skipVideo(videoElm: HTMLMediaElement, skipTimeInSecond: number) {
    console.debug(`Skipped: ${skipTimeInSecond} [sec]`);
    videoElm.currentTime += skipTimeInSecond - this.TIMEGAP;
  }
}