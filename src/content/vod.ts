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
    this.telop.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect fill="#0078D4" stroke="#0078D4" stroke-width="8" width="30" height="30" x="25" y="85"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></rect><rect fill="#0078D4" stroke="#0078D4" stroke-width="8" width="30" height="30" x="85" y="85"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></rect><rect fill="#0078D4" stroke="#0078D4" stroke-width="8" width="30" height="30" x="145" y="85"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></rect></svg>'
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