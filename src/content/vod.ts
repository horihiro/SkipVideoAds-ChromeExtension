export class Vod {
  protected TIMEGAP: number;
  protected telop: HTMLDivElement;
  constructor() {
    this.TIMEGAP = 0.1;
    this.telop = document.createElement('div');
    this.telop.style.position = 'absolute';
    this.telop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.telop.style.top = '0';
    this.telop.style.left = '0';
    this.telop.style.width = '100%';
    this.telop.style.height = '100%';
    this.telop.style.lineHeight = '50';
    this.telop.style.color = 'white';
    this.telop.style.textAlign = 'center';
    this.telop.textContent = 'Skiping Ads...';

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