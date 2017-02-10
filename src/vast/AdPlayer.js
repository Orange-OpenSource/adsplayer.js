/**
 * The AdPlayer manages the sequencing of playing creatives of a single Ad.
 * It takes as input the Ad object as returned by the VAST parser.
 * The AdPlayer plays sequentially all contained Creatives,
 * with the help of a CreativePlayer.
 *
 * Dispatch events:
 *  - "adStart" when the first creative is played
 *  - "adEnd" when all the creative are played
 *
 */

import CreativePlayer from './CreativePlayer';
import Debug from '../Debug';
import EventBus from '../EventBus';

class AdPlayer {

    _sendImpressions (impressions){
        let impression;

        if (impressions.length === 0) {
            return;
        }

        for (let i = 0; i < impressions.length; i++) {
            impression = impressions[i];
            if (impression.uri && impression.uri.length > 0) {
                var http = new XMLHttpRequest();
                this._debug.log("Send Impression, uri = " + impression.uri);
                http.open("GET", impression.uri, true);
                http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                http.send();
            }
        }
    }

    _onCreativeEnd (){

        this._debug.log("Creative ended");

        // Stop the current creative media
        this._stopCreative();

        // Play next creative
        this._playNextCreative();
    }

    _pauseCreative (){
        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.pause();
    }

    _resumeCreative (){
        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.play();
    }

    _stopCreative () {
        if (!this._creativePlayer) {
            return;
        }
        this._eventBus.removeEventListener('creativeEnd', this._onCreativeEndListener);
        this._creativePlayer.stop();
        this._creativePlayer = null;
    }

    _playCreative(index){
        let creative = this._ad.inLine.creatives[index],
            linear;

        this._creativeIndex = index;
        this._debug.log("Play Creative - index = " + this._creativeIndex);

        // Play Linear element
        linear = creative.linear;

        if (linear) {
            this._debug.log("Play Linear Ad, duration = " + linear.duration);
            this._eventBus.addEventListener('creativeEnd', this._onCreativeEndListener);
            this._creativePlayer = new CreativePlayer();
            if (!this._creativePlayer.init(creative.linear, this._adPlayerContainer, this._mainVideo, this._baseUrl)) {
                this._playNextCreative();
            }
        } else {
            this._playNextCreative();
        }
    }

    _playAd(){

        // Send Impressions tracking
        this._sendImpressions(this._ad.inLine.impressions);

        // Play first Creative
        this._playCreative(0);
    }

    _playNextCreative(){

        this._creativeIndex++;

        if (this._creativeIndex < this._ad.inLine.creatives.length) {
            this._playCreative(this._creativeIndex);
        } else {
            // Notify end of trigger
            this._eventBus.dispatchEvent({
                type: "adEnd",
                data: {}
            });
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    /**
     * Initializes the AdPlayer
     * @method constructor
     * @access public
     * @memberof AdPlayer#
     */

    constructor () {
        this._ad = null;
        this._adPlayerContainer = null;
        this._mainVideo = null;
        this._baseUrl = '';
        this._creativeIndex = -1;
        this._creativePlayer = null;
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();

        this._onCreativeEndListener = this._onCreativeEnd.bind(this);
    }

    /**
     * Initializes the AdManager.
     * @method init
     * @access public
     * @memberof VastPlayerManager#
     * @param {Object} ad - the Ad to play
     * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {string} baseUrl - the base URL for media files
     */
    init (ad, adPlayerContainer, mainVideo, baseUrl) {
        this._ad = ad;
        this._adPlayerContainer = adPlayerContainer;
        this._mainVideo = mainVideo;
        this._baseUrl = baseUrl;
    }

    start () {
        // Notify an Ad is starting to play
        this._eventBus.dispatchEvent({
            type: 'adStart',
            data: {}
        });

        // Play first Creative
        this._playCreative(0);
    }

    play () {
        this._resumeCreative();
    }

    pause () {
        this._pauseCreative();
    }

    stop () {
        this._stopCreative();
    }
}

export default AdPlayer;
