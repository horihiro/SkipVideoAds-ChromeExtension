export class Vod {
  startWatching() {
    console.error('Need to implement startWatching');
    throw new Error('Not implemented');
  }

  skipVideo(videoElm: HTMLMediaElement, skipTimeInSecond: number) {
    videoElm.currentTime += skipTimeInSecond - 0.01;
  }
}