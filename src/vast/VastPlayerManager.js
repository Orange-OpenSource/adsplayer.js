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
        var creative = this._vasts[this._vastIndex].ads[0].inLine.creatives[index],
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
            ad = vast.ads[0];

        if (ad === null) {
            // Empty VAST
            return;
        }

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
        var ad = this._vasts[this._vastIndex].ads[0];

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
