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
* The VastPlayerManager manages the sequencing of playing ads of a single VAST.
* It takes as input the list of Vast objects as returned by the VAST parser.
* For each Vast, the VastPlayerManager plays sequentially all contained Ads,
* with the help of an AdPlayer.
*/


import AdPlayer from './AdPlayer';
import Debug from '../Debug';
import EventBus from '../EventBus';

class VastPlayerManager {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _onAdEnd () {

        this._debug.log("Ad ended");

        // Stop the current Ad
        this._stopAd();

        // Play next Ad
        this._playNextAd();
    }

    _pauseAd () {
        if (!this._adPlayer) {
            return;
        }
        this._adPlayer.pause();
    }

    _resumeAd () {
        if (!this._adPlayer) {
            return;
        }
        this._adPlayer.play();
    }

    _stopAd () {
        if (!this._adPlayer) {
            return;
        }
        this._eventBus.removeEventListener('adEnd', this._onAdEndListener);
        this._adPlayer.stop();
        this._adPlayer = null;
    }

    _playAd (index) {
        let vast = this._vasts[this._vastIndex],
            ad = vast.ads[index];

        this._adIndex = index;
        this._debug.log("Play Ad - index = " + this._adIndex);

        this._eventBus.addEventListener('adEnd', this._onAdEndListener);
        this._adPlayer = new AdPlayer();
        this._adPlayer.init(ad, this._adPlayerContainer, this._mainVideo, vast.baseUrl);
        this._adPlayer.start();
    }

    _playNextAd () {
        let vast = this._vasts[this._vastIndex];

        this._adIndex++;

        if (this._adIndex < vast.ads.length) {
            this._playAd(this._adIndex);
        } else {
            this._playNextVast();
        }
    }

    _playVast (index) {
        let vast = this._vasts[index];

        if (vast.ads.length === 0) {
            // Empty VAST
            return;
        }

        this._vastIndex = index;
        this._debug.log("Play Vast - index = " + this._vastIndex);

        // Play first Ad
        this._playAd(0);
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

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor () {
        this._vasts = [];
        this._adPlayerContainer = null;
        this._adIndex = -1;
        this._adPlayer = null;
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();
        this._onAdEndListener = this._onAdEnd.bind(this);
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
        this._mainVideo = mainVideo;
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
        this._resumeAd();
    }

    pause () {
        this._pauseAd();
    }

    stop () {
        this._stopAd();
    }
}

export default VastPlayerManager;
