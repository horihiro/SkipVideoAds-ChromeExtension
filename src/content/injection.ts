import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { IMASdk } from './vods/ima_sdk';

(() => {
  const VOD_CLASSES = [
    AmazonPrimeVideo,
    YouTube,
    IMASdk,
  ];
  const init = () => {
    const vodClass = VOD_CLASSES.find((vodClass) => {
      if (vodClass.isAvailable()) {
        console.debug(`${vodClass.name} detected`);
        return true;
      }
      return false;
    });
    vodClass && vodClass.injection();
  }
  init();
})();