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


import AdPlayer from './AdPlayer';
import Debug from '../Debug';
import EventBus from '../EventBus';

class VastPlayerManager {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _onAdEnd() {

        this._debug.log("(VastPlayerManager) _onAdEnd");

        this._eventBus.removeEventListener('adEnd', this._onAdEndListener);

        // Stop the current ad
        this._stopAd();

        // Play next ad
        this._playNextAd();
    }

    _pauseAd() {
        this._debug.log("(VastPlayerManager) _pauseAd");

        if (this._adPlayer) {
            this._adPlayer.pause();
        }

    }

    _resumeAd () {
        this._debug.log("(VastPlayerManager) _resumeAd");

        if (this._adPlayer) {
            this._adPlayer.play();
        }

    }

    _resetAd () {
        this._debug.log("(VastPlayerManager) _resetAd");

        if (this._adPlayer) {
            this._adPlayer.reset();
        }

    }

    _stopAd () {
        this._debug.log("(VastPlayerManager) _stopAd");

        if (this._adPlayer) {
            this._adPlayer.stop();
        }

    }

    _playAd (index) {

        this._debug.log("(VastPlayerManager) _playAd(" + index + ")");

        this._adPlayer = new AdPlayer(this._vasts[0].ads[index], this._adPlayerContainer,this._mainVideo,this._vasts[0].baseUrl);

        this._eventBus.addEventListener('adEnd', this._onAdEndListener);
        this._adPlayer.start();
    }

    _playNextAd () {

        let index = this._getNextAdIndex();

        if (index < this._vasts[0].ads.length) {
           this._playAd(index);
        } else {
            // Notify end of trigger
            this._eventBus.dispatchEvent({
                type: 'triggerEnd',
                data: {}
            });
        }
    }

    _getNextAdIndex () {

        if (this._isAdPods === true) {

            let indexNextSeq = Number.MAX_VALUE;
            let currSeqNumber = this._vasts[0].ads[this._adIndex].sequence;
            let minSuperiorSeqNumber = Number.MAX_VALUE;

            this._vasts[0].ads.forEach(function(ad,index){

                // Store the index of the minimum superior sequence number.
                if ( (ad.sequence > currSeqNumber) && (ad.sequence < minSuperiorSeqNumber) ) {
                    indexNextSeq=index;
                    minSuperiorSeqNumber = ad.sequence;
                }
            });
            this._adIndex = indexNextSeq;

        } else {
            this._adIndex++;
        }

        this._debug.log("(VastPlayerManager) Next ad index: "+this._adIndex);

        return this._adIndex;
    }

    _getFirstAdIndex () {

        let minSeq=Number.MAX_VALUE;
        let indexMinSeq=0;

        // Do we have an ad pods in this vast?
        for (let i=0;i<this._vasts[0].ads.length;i++) {
            if (this._vasts[0].ads[i].sequence !== null) {
                this._isAdPods = true;
            }

            // Store the index of the minimum sequence number.
            if (this._vasts[0].ads[i].sequence < minSeq) {
                minSeq=this._vasts[0].ads[i].sequence;
                indexMinSeq=i;
            }
        }

        // If an ad pods is present
        if (this._isAdPods === true) {
            // The first one to play is the one with smallest sequence number
            this._adIndex=indexMinSeq;
            this._debug.log("(VastPlayerManager) adpods detected");
        } else {
            this._debug.log("(VastPlayerManager) No adpods");
            this._adIndex=0;
        }

        this._debug.log("(VastPlayerManager) First ad index: "+this._adIndex);

        return this._adIndex;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    /**
     * Initializes the VastPlayerManager.
     * @method constructor
     * @access public
     * @memberof VastPlayerManager#
     * @param {Array} vasts - the array of Vast components to play
     * @param {Object} adPlayerContainer - the HTML DOM container for ads player components
     * @param {Object} mainVideo - the HTML DOM container for video player components
     */
    constructor(){

        this._vasts = [];
        this._adPlayerContainer = null;
        this._adIndex = 0;
        this._isAdPods = false;
        this._adPlayer = null;
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();

        this._onAdEndListener = this._onAdEnd.bind(this);
    }

    init(vasts, adPlayerContainer, mainVideo){
        this._vasts = vasts;
        this._adPlayerContainer = adPlayerContainer;
        this._mainVideo = mainVideo;
    }

    start() {
        if (!this._vasts || this._vasts.length === 0) {
            return;
        }

        // Notify a trigger is starting to play
        this._eventBus.dispatchEvent({
            type: 'triggerStart',
            data: {}
        });

        this._playAd(this._getFirstAdIndex());
    }

    play() {
        this._resumeAd();
    }

    pause() {
        this._pauseAd();
    }

    stop() {
        this._stopAd();
    }

    reset() {
        this._resetAd();
        this._eventBus.removeEventListener('adEnd', this._onAdEndListener);
        this._mainVideo = null;
        this._adPlayerContainer = null;
        this._vasts = null;
    }
}

export default VastPlayerManager;
