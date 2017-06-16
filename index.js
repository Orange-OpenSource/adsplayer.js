
import "babel-polyfill";
import AdsPlayer from './src/AdsPlayer';

// Shove both of these into the global scope
var context = (typeof window !== 'undefined' && window) || global;

var adsplayer = context.adsplayer;
if (!adsplayer) {
    adsplayer = context.adsplayer = {};
}

adsplayer.AdsPlayer = AdsPlayer;

export default adsplayer;
export { AdsPlayer };
