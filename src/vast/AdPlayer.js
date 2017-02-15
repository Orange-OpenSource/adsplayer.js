/*
* The copyright in this software module is being made available under the BSD License, included
* below. This software module may be subject to other third party and/or contributor rights,
* including patent rights, and no such rights are granted under this license.
*
* Copyright (c) 2016, Orange
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted
* provided that the following conditions are met:
* - Redistributions of source code must retain the above copyright notice, this list of conditions
*   and the following disclaimer.
* - Redistributions in binary form must reproduce the above copyright notice, this list of
*   conditions and the following disclaimer in the documentation and/or other materials provided
*   with the distribution.
* - Neither the name of Orange nor the names of its contributors may be used to endorse or promote
*   products derived from this software module without specific prior written permission.
*
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
* IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
* FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER O
* CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
* WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
* WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
* The AdPlayer manages the sequencing of playing creatives of a single Ad.
* It takes as input the Ad object as returned by the VAST parser.
* The AdPlayer plays sequentially all contained Creatives,
* with the help of a CreativePlayer.
*
* Dispatch events:
*  - 'adStart' when when the playback of the ad (first creative) is starting.
*  - 'adEnd' when the playback of the (all creatives) has ended
*/

import CreativePlayer from './CreativePlayer';
import Debug from '../Debug';
import EventBus from '../EventBus';

class AdPlayer {

    _sendImpressions (impressions) {
        let impression;

        if (impressions.length === 0) {
            return;
        }

        for (let i = 0; i < impressions.length; i++) {
            impression = impressions[i];
            if (impression.uri && impression.uri.length > 0) {
                this._debug.info("Send Impression, uri = " + impression.uri);
                let http = new XMLHttpRequest();
                http.open("GET", impression.uri, true);
                http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                http.send();
            }
        }
    }

    _onCreativeEnd () {
        this._debug.info("Creative ended");

        // Stop the current creative media
        this. _stopCreative();

        this._resetCreative();

        // Play next creative
        this._playNextCreative();
    }

    _pauseCreative () {
        this._debug.info("Creative paused");

        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.pause();
    }

    _resumeCreative () {
        this._debug.info("Creative resumed");

        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.play();
    }

    _resetCreative () {
    	this._debug.info("Creative resetted");
        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.reset();
    }

    _stopCreative(){
        this._eventBus.removeEventListener('creativeEnd', this._onCreativeEndListener);

        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.stop();
        this._creativePlayer = null;
    }

    _playCreative (index) {
        this._debug.info("Play Creative - index = " + this._creativeIndex);

        let creative = this._ad.inLine.creatives[index],
            linear;

        this._creativeIndex = index;

        // Play Linear element
        linear = creative.linear;

        if (linear) {
            this._debug.info("Play Linear Ad, duration = " + linear.duration);
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

    _playAd () {

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
            // Notify end of Ad
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
