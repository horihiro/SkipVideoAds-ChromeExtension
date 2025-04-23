export class Vod {
  protected TIMEGAP: number;
  protected overlay: HTMLDivElement;
  constructor() {
    this.TIMEGAP = 0.1;
    this.overlay = document.createElement('div');
    this.overlay.className = 'skip-vod-overlay';
    this.overlay.style.position = 'absolute';
    this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.color = 'white';
    this.overlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 50">
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
  }
  startWatching() {
    console.error('Need to implement startWatching');
    throw new Error('Not implemented');
  }

  skipVideo(videoElm: HTMLMediaElement, skipTimeInSecond: number) {
    console.debug(`Skipped: ${skipTimeInSecond} [sec]`);
    videoElm.currentTime += skipTimeInSecond - this.TIMEGAP;
  }
}