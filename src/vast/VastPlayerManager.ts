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

import * as vast from './model/Vast';
import { AdPlayer } from './AdPlayer';
import { Logger } from '../Logger';
import { EventBus } from '../EventBus';

export class VastPlayerManager {

    // #region MEMBERS
    // --------------------------------------------------

    private vasts: vast.Vast[];
    private adPlayerContainer: HTMLElement;
    private mainVideo: HTMLMediaElement;
    private vastIndex: number;
    private adIndex: number;
    private adPlayer: AdPlayer;
    private logger: Logger;
    private eventBus: EventBus;

    private onAdEndListener;


    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor () {
        this.vasts = [];
        this.adPlayerContainer = null;
        this.mainVideo = null;
        this.vastIndex = -1;
        this.adIndex = -1;
        this.adPlayer = null;
        this.logger = Logger.getInstance();
        this.eventBus = EventBus.getInstance();
        this.onAdEndListener = this.onAdEnd.bind(this);
    }

    /**
     * Initializes the VastPlayerManager.
     * @method init
     * @access public
     * @memberof VastPlayerManager#
     * @param {Array} vasts - the array of Vast components to play
     * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
     */
    init (vasts: vast.Vast[], adPlayerContainer: HTMLElement, mainVideo: HTMLMediaElement) {
        this.vasts = vasts;
        this.adPlayerContainer = adPlayerContainer;
        this.mainVideo = mainVideo;
    }

    start () {
        if (!this.vasts || this.vasts.length === 0) {
            return;
        }

        // Notify a trigger is starting to play
        this.eventBus.dispatchEvent({
            type: 'triggerStart',
            data: {}
        });

        this.playVast(0);
    }

    play () {
        this.resumeAd();
    }

    pause () {
        this.pauseAd();
    }

    stop () {
        this.stopAd();
    }

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private onAdEnd () {

        this.logger.debug('Ad ended');

        // Stop the current Ad
        this.stopAd();

        // Play next Ad
        this.playNextAd();
    }

    private pauseAd () {
        if (!this.adPlayer) {
            return;
        }
        this.adPlayer.pause();
    }

    private resumeAd () {
        if (!this.adPlayer) {
            return;
        }
        this.adPlayer.play();
    }

    private stopAd () {
        if (!this.adPlayer) {
            return;
        }
        this.eventBus.removeEventListener('adEnd', this.onAdEndListener);
        this.adPlayer.stop();
        this.adPlayer = null;
    }

    private playAd (index: number) {
        let vast = this.vasts[this.vastIndex],
            ad = vast.ads[index];

        this.adIndex = index;
        this.logger.debug('Play Ad - index = ' + this.adIndex);

        this.eventBus.addEventListener('adEnd', this.onAdEndListener);
        this.adPlayer = new AdPlayer();
        this.adPlayer.init(ad, this.adPlayerContainer, this.mainVideo, vast.baseUrl);
        this.adPlayer.start();
    }

    private playNextAd () {
        let vast = this.vasts[this.vastIndex];

        this.adIndex++;

        if (this.adIndex < vast.ads.length) {
            this.playAd(this.adIndex);
        } else {
            this.playNextVast();
        }
    }

    private playVast (index: number) {
        let vast = this.vasts[index];

        if (vast.ads.length === 0) {
            // Empty VAST
            return;
        }

        this.vastIndex = index;
        this.logger.debug('Play Vast - index = ' + this.vastIndex);

        // Play first Ad
        this.playAd(0);
    }

    private playNextVast () {

        this.vastIndex++;

        if (this.vastIndex < this.vasts.length) {
            this.playVast(this.vastIndex);
        } else {
            // Notify end of trigger
            this.eventBus.dispatchEvent({
                type: 'triggerEnd',
                data: {}
            });
        }
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------    
}

export default VastPlayerManager;
