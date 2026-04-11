// import { AmazonPrimeVideo } from './vods/amazon_prime_video';
import { YouTube } from './vods/youtube';
import { Netflix } from './vods/netflix';
// import { IMASdk } from './vods/ima_sdk';

(() => {
  const VOD_CLASSES = [
    // AmazonPrimeVideo,
    YouTube,
    Netflix,
    // IMASdk,
  ];
  const init = () => {
    const vodClass = VOD_CLASSES.find((vodClass) => {
      if (!vodClass.isAvailable()) return false;

      console.debug(`${vodClass.name} detected`);
      return true;
    });
    vodClass && vodClass.injection();
  }
  init();
})();