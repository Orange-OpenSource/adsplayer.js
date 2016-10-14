/**
* The VastPlayerManager manages the sequencing of playing creatives of a single VAST.
* It takes as input the list of Vast objects as returned by the VAST parser.
* For each Vast, the VastPlayerManager plays sequentially all contained Creatives,
* with the help of a CreativePlayer.
*/


import CreativePlayer from './CreativePlayer';
import Debug from '../Debug';
import ErrorHandler from '../ErrorHandler';
import EventBus from '../EventBus';

class VastPlayerManager {


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _sendImpressions (impressions) {
        let impression;

        if (impressions.length === 0) {
            return;
        }

        for (let i = 0; i < impressions.length; i++) {
            impression = impressions[i];
            if (impression.uri && impression.uri.length > 0) {
                this._debug.log("Send Impression, uri = " + impression.uri);
                let http = new XMLHttpRequest();
                http.open("GET", impression.uri, true);
                http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                http.send();
            }
        }
    }

    _onCreativeEnd () {

        this._debug.log("Creative ended");

        // Stop the current creative media
        this._stopCreative();

        // Play next creative
        this._playNextCreative();
    }

    _pauseCreative () {
        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.pause();
    }

    _resumeCreative () {
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
    }

    _playCreative (index) {
        var creative = this._vasts[this._vastIndex].ad.inLine.creatives[index],
            linear;

        this._creativeIndex = index;
        this._debug.log("Play Creative - index = " + this._creativeIndex);

        // Play Linear element
        linear = creative.linear;

        if (linear) {
            this._debug.log("Play Linear Ad, duration = " + linear.duration);
            this._eventBus.addEventListener('creativeEnd', this._onCreativeEndListener);
            if (!this._creativePlayer.load(creative.linear, this._vasts[this._vastIndex].baseUrl)) {
                this._playNextCreative();
            }
        } else {
            this._playNextCreative();
        }
    }

    _playVast (index) {
        var vast = this._vasts[index],
            ad = vast.ad;

        this._vastIndex = index;
        this._debug.log("Play Vast - index = " + this._vastIndex + ", Ad id = " + ad.id);

        // Send Impressions tracking
        this._sendImpressions(ad.inLine.impressions);

        // Play first Creative
        this._playCreative(0);
    }

    _playNextVast () {

        this._vastIndex++;

        if (this._vastIndex < this._vasts.length) {
            this._playVast(this._vastIndex);
        } else {
            // Notify end of trigger
            this._eventBus.dispatchEvent({
                type: 'triggerEnd',
                data: {}
            });
        }
    }

    _playNextCreative () {
        var ad = this._vasts[this._vastIndex].ad;

        this._creativeIndex++;

        if (this._creativeIndex < ad.inLine.creatives.length) {
            this._playCreative(this._creativeIndex);
        } else {
            this._playNextVast();
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._vasts = [];
        this._adPlayerContainer = null;
        this._vastIndex = -1;
        this._creativeIndex = -1;
        this._creativePlayer = new CreativePlayer();
        this._errorHandler = ErrorHandler.getInstance();
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();
        this._mediaPlayer = null;
        this._onCreativeEndListener = this._onCreativeEnd.bind(this);
    }

    /**
     * Initializes the VastPlayerManager.
     * @method init
     * @access public
     * @memberof VastPlayerManager#
     * @param {Array} vasts - the array of Vast components to play
     * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
     */
    init (vasts, adPlayerContainer, mainVideo) {
        this._vasts = vasts;
        this._adPlayerContainer = adPlayerContainer;
        this._creativePlayer.init(this._adPlayerContainer, mainVideo);
    }

    start () {
        if (!this._vasts || this._vasts.length === 0) {
            return;
        }

        // Notify a trigger is starting to play
        this._eventBus.dispatchEvent({
            type: 'triggerStart',
            data: {}
        });

        this._playVast(0);
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

    reset () {
        this._creativePlayer.reset();
    }
}

export default VastPlayerManager;
