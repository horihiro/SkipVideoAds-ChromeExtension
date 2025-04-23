export class Vod {
  protected TIMEGAP: number;
  protected telop: HTMLDivElement;
  constructor() {
    this.TIMEGAP = 0.1;
    this.telop = document.createElement('div');
    this.telop.className = 'skip-vod-telop';
    this.telop.style.position = 'absolute';
    this.telop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.telop.style.top = '0';
    this.telop.style.left = '0';
    this.telop.style.width = '100%';
    this.telop.style.height = '100%';
    this.telop.style.color = 'white';
    this.telop.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 50">
  <polygon points="32,18 45,25 32,32" fill="white">
    <animate attributeName="opacity" from="1" to="0" dur="0.5s" repeatCount="indefinite"></animate>
  </polygon>
  <polygon points="45,18 58,25 45,32" fill="white">
    <animate attributeName="opacity" from="1" to="0" dur="0.5s" repeatCount="indefinite"></animate>
  </polygon>
  <rect x="58" y="18" width="3" height="14" fill="white">
    <animate attributeName="opacity" from="1" to="0" dur="0.5s" repeatCount="indefinite"></animate>
  </rect>
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