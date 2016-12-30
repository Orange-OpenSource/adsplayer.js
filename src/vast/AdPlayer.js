/** Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive
 *
 * Reason: VAST-3.0 support for Linear Ads.
 * Author: alain.lebreton@viaccess-orca.com
 * Ref: CSWP-28
 *
 */

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
                    this._debug.info("(AdPlayer) Send Impression, uri = " + impression.uri);
                    var http = new XMLHttpRequest();
                    http.open("GET", impression.uri, true);
                    http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    http.send();
                }
            }
        }

        _onCreativeEnd (){

            this._debug.info("(AdPlayer) onCreativeEnd");

            // Stop the current creative media
            this. _stopCreative();

            this._resetCreative();

            // Play next creative
            this._playNextCreative();
        }

        _pauseCreative (){
            this._debug.info("(AdPlayer) pauseCreative ");
            if (!this._creativePlayer) {
                return;
            }
            this._creativePlayer.pause();
        }

        _resumeCreative (){
            this._debug.info("(AdPlayer) resumeCreative ");
            if (!this._creativePlayer) {
                return;
            }
            this._creativePlayer.play();
        }

        _resetCreative(){
            this._debug.info("(AdPlayer) resetCreative ");
            if (!this._creativePlayer) {
                return;
            }
            this._creativePlayer.reset();
        }

        _stopCreative(){
            this._debug.info("(AdPlayer) stopCreative ");
            this._eventBus.removeEventListener('creativeEnd', this._onCreativeEndListener);

            if (!this._creativePlayer) {
                return;
            }
            this._creativePlayer.stop();
            this._creativePlayer = null;
        }

        _playCreative(index){
            let creative = this._ad.inLine.creatives[index],
                linear;

            this._creativeIndex = index;
            this._debug.info("(AdPlayer) playCreative(" + this._creativeIndex + ")");

            // Play Linear element
            linear = creative.linear;

            if (linear) {
                this._debug.info("(AdPlayer) Play Linear Ad, duration = " + linear.duration);
                this._eventBus.addEventListener('creativeEnd', this._onCreativeEndListener);
                this._creativePlayer = new CreativePlayer();
                this._creativePlayer.init(this._adPlayerContainer, this._mainVideo);
                if (!this._creativePlayer.load(creative.linear, this._baseUrl)) {
                    this._playNextCreative();
                }
            } else {
                this._playNextCreative();
            }
        }

        _playAd(){

           this._debug.info("(AdPlayer) PlayAd id = " + this._ad.id);

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
     * @param {Object} ad - the Ad to play
     * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {string} baseUrl - TODO
     */

    constructor(ad, adPlayerContainer, mainVideo, baseUrl) {
        this._ad = ad;
        this._adPlayerContainer = adPlayerContainer;
        this._mainVideo = mainVideo;
        this._baseUrl = baseUrl;
        this._creativeIndex = -1;
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();
        this._creativePlayer = null;

        this._onCreativeEndListener = this._onCreativeEnd.bind(this);
    }

    start(){

        // Notify an ad is starting to play
        this._eventBus.dispatchEvent({
            type: 'adStart',
            data: {}
        });

        this._playAd();
    }

    play() {
        this._resumeCreative();
    }

    pause() {
        this._pauseCreative();
    }

    stop() {
        if (!this._creativePlayer) {
            return;
        }

        this._creativePlayer.abort();
        this._stopCreative();
    }

    reset() {
        if (!this._creativePlayer) {
            return;
        }

        this._creativePlayer.reset();
    }
}

export default AdPlayer;
