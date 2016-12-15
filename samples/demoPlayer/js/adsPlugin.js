/**
 * Created by vobox on 9/28/16.
 */

class AdsPlugin {
    constructor(){
        this.adsPlayer = new adsplayer.AdsPlayer(document.getElementById('adsplayer-container'));
        this.adsPlayer.addEventListener('start', this.onAdsPlayerToggle.bind(this));
        this.adsPlayer.addEventListener('end', this.onAdsPlayerToggle.bind(this));
        this.adsPlayer.addEventListener('addElement', this.onAdsPlayerAddElement.bind(this));
        this.adsPlayer.addEventListener('removeElement', this.onAdsPlayerRemoveElement.bind(this));
        this.adsPlayer.addEventListener('play', this.onAdsPlayerPlayPause.bind(this));
        this.adsPlayer.addEventListener('pause', this.onAdsPlayerPlayPause.bind(this));
        this.adsPlayer.addEventListener('click', this.onAdsPlayerClick.bind(this));

        this.adsMode=false;

        document.getElementById('adsplayer_version').textContent+="  "+this.adsPlayer.getVersion();

    }

    onAdsPlayerToggle(e) {
        console.log("onAdsPlayerToggle - " + e.type);
        this.adsMode = (e.type === 'start');
        document.getElementById('videoplayer-container').style.display = this.adsMode ? 'none' : 'block';
    }

    onAdsPlayerPlayPause(e) {
        console.log("onAdsPlayerPlayPause - " + e.type);
        var play = (e.type === 'play');
        //handleAdsPlayerPlayState(play);
    }

    onAdsPlayerClick(e) {
        console.log("onAdsPlayerClick - " + e.type);
        if (e.data.uri) {
            window.open(e.data.uri);
        }
    }

    onAdsPlayerAddElement(e) {
        console.log("onAdsPlayerAddElement - " + e.type + " / " + e.data.type);
    }

    onAdsPlayerRemoveElement(e) {
        console.log("onAdsPlayerRemoveElement - " + e.type + " / " + e.data.type);
    }

    getPlugin(){
        return this.adsPlayer;
    }

    getAdsMode(){
        return this.adsMode;
    }
}
