export class Vod {
  startWatching() {
    console.error('Need to implement startWatching');
    throw new Error('Not implemented');
  }

  async skipVideo(videoElm: HTMLMediaElement, skipTimeInSecond: number) {
    // while (true) {
    //   // if (videoElm.paused) {
    //   //   await new Promise(resolve => setTimeout(resolve, 100));
    //   //   continue;
    //   // }
    // }
    videoElm.currentTime += skipTimeInSecond - 0.01;
  }
}