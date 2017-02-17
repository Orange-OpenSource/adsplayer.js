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

        this._debug.info("Ad ended");

        this._eventBus.removeEventListener('adEnd', this._onAdEndListener);

        // Stop the current Ad
        this._stopAd();

        // Play next Ad
        this._playNextAd();
    }

    _pauseAd () {
        this._debug.info("Ad paused");

        if (!this._adPlayer) {
            return;
        }
        this._adPlayer.pause();
    }

    _resumeAd () {
        this._debug.info("Ad resumed");

        if (!this._adPlayer) {
            return;
        }
        this._adPlayer.play();

    }

    _resetAd () {
        this._debug.info("Ad resetted");

        if (!this._adPlayer) {
            return;
        }
        this._adPlayer.reset();
    }

    _stopAd () {
        this._debug.info("Ad stopped");

         if (!this._adPlayer) {
            return;
        }
        this._adPlayer.stop();
    }

    _playAd (vastIndex,adIndex) {

        this._debug.info("Ad played - vastIndex = " + vastIndex + ", adIndex = " + adIndex);

        this._adPlayer = new AdPlayer();
        this._adPlayer.init(this._vasts[vastIndex].ads[adIndex], this._adPlayerContainer, this._mainVideo, this._vasts[vastIndex].baseUrl);

        this._eventBus.addEventListener('adEnd', this._onAdEndListener);
        this._adPlayer.start();
    }

    _playNextAd () {

        let currentVastIndex = this._vastIndex;
        let nextAdIndex = this._getNextAdIndex(currentVastIndex);

        if (nextAdIndex < this._vasts[currentVastIndex].ads.length) {
            // play next ad in the current vast
            this._playAd(currentVastIndex,nextAdIndex);
        } else {
            let nextVastIndex = this._getNextVastIndex();
            if (nextVastIndex < this._vasts.length) {
                // play next ad in the current vast
                let firstAdIndex = this._getFirstAdIndex(nextVastIndex);
                this._playAd(nextVastIndex, firstAdIndex);
            } else {

                // Notify end of trigger
                this._eventBus.dispatchEvent({
                    type: 'triggerEnd',
                    data: {}
                });
            }
        }
    }

    _getNextAdIndex () {

        this._adIndex++;

        this._debug.info("Next ad index: "+this._adIndex);

        return this._adIndex;
    }

    _getFirstAdIndex () {

        this._adIndex=0;

        this._debug.info("First ad index: " + this._adIndex);

        return this._adIndex;
    }

    _getNextVastIndex () {
        this._vastIndex++;
        return this._vastIndex;
    }

    _getFirstVastIndex () {
        this._vastIndex = 0;
        return this._vastIndex;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._vasts = [];
        this._adPlayerContainer = null;
        this._adIndex = 0;
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

        this._playAd(this._getFirstVastIndex(),this._getFirstAdIndex(this._getFirstVastIndex()));
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

    reset () {
        this._resetAd();
        this._eventBus.removeEventListener('adEnd', this._onAdEndListener);
        this._mainVideo = null;
        this._adPlayerContainer = null;
        this._vasts = null;
    }
}

export default VastPlayerManager;