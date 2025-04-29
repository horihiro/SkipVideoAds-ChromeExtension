export const SkipMode = {
  auto: 'auto',
  manual: 'manual',
  none: 'none',
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
${skipMode === SkipMode.auto ? `<path transform="matrix(0 0.016 -0.016 0 46 17)" d="m500 133c-10 0-20 5-25 15l-375 652c-30 50-25 75 25 75l375-0.26172 375 0.26172c50 0 55-25 25-75l-375-652c-5-10-15-15-25-15z" fill="white" stroke-width="3.7796">
    <animate
      attributeName="opacity"
      values="1;0;1"
      dur="0.5s"
      repeatCount="indefinite" />
  </path>
  <path transform="matrix(0 0.016 -0.016 0 59 17)" d="m500 133c-10 0-20 5-25 15l-375 652c-30 50-25 75 25 75l375-0.26172 375 0.26172c50 0 55-25 25-75l-375-652c-5-10-15-15-25-15z" fill="white" stroke-width="3.7796">
    <animate
      attributeName="opacity"
      values="0.5;1;0.5;0;0.5"
      dur="0.5s"
      repeatCount="indefinite" />
  </path>
  <path transform="matrix(0 0.016 -0.016 0 72 17)" d="m500 133c-10 0-20 5-25 15l-375 652c-30 50-25 75 25 75l375-0.26172 375 0.26172c50 0 55-25 25-75l-375-652c-5-10-15-15-25-15z" fill="white" stroke-width="3.7796">
    <animate
      attributeName="opacity"
      values="0;1;0"
      dur="0.5s"
      repeatCount="indefinite" />
  </path>
` : (SkipMode.manual ? `<path transform="matrix(0 0.016 -0.016 0 57 17)" d="m500 133c-10 0-20 5-25 15l-375 652c-30 50-25 75 25 75l375-0.26172 375 0.26172c50 0 55-25 25-75l-375-652c-5-10-15-15-25-15z" fill="white" stroke-width="3.7796">
    <animate
      attributeName="opacity"
      values="1;0;1"
      dur="1.5s"
      repeatCount="indefinite" />
  </path>
  <rect x="55" y="19" width="3" height="12" rx="0.5" ry="0.5" fill="white">
    <animate
      attributeName="opacity"
      values="1;0;1"
      dur="1.5s"
      repeatCount="indefinite" />
  </rect>
`: '')}</svg>`
    return this.overlayElm;
  }
  static isAvaulable(): boolean {
    console.error('Need to implement startWatching');
    throw new Error('Not implemented');
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