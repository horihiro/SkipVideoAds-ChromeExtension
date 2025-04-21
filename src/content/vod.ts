export class Vod {
  protected TIMEGAP: number;
  constructor() {
    this.TIMEGAP = 0.1;
  }
  startWatching() {
    console.error('Need to implement startWatching');
    throw new Error('Not implemented');
  }

  skipVideo(videoElm: HTMLMediaElement, skipTimeInSecond: number) {
    videoElm.currentTime += skipTimeInSecond - this.TIMEGAP;
  }
}