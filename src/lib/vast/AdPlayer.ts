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

import * as vast from './model/Vast';
import { CreativePlayer } from './CreativePlayer';
import { Logger } from '../Logger';
import { EventBus, AdEvents } from '../EventBus';
import { EventTypes } from '../../Events';

export class AdPlayer {

    // #region MEMBERS
    // --------------------------------------------------

    private ad: vast.Ad;
    private adPlayerContainer: HTMLElement;
    private mainVideo: HTMLMediaElement;
    private baseUrl: string;
    private creativeIndex: number;
    private creativePlayer: CreativePlayer;
    private logger: Logger;
    private eventBus: EventBus;

    private onCreativeEndListener;


    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    /**
     * Initializes the AdPlayer
     * @method constructor
     * @access public
     * @memberof AdPlayer#
     */

    constructor (eventBus) {
        this.ad = null;
        this.adPlayerContainer = null;
        this.mainVideo = null;
        this.baseUrl = '';
        this.creativeIndex = -1;
        this.creativePlayer = null;
        this.logger = Logger.getInstance();
        this.eventBus = eventBus;

        this.onCreativeEndListener = this.onCreativeEnd.bind(this);
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
    init (ad: vast.Ad, adPlayerContainer: HTMLElement, mainVideo: HTMLMediaElement, baseUrl: string) {
        this.ad = ad;
        this.adPlayerContainer = adPlayerContainer;
        this.mainVideo = mainVideo;
        this.baseUrl = baseUrl;
    }

    start () {
        // Notify an Ad is starting to play
        this.eventBus.dispatchEvent(AdEvents.AD_START);

        // Send Impressions tracking
        this.sendImpressions(this.ad.inLine.impressions);

        // Play first Creative
        this.playCreative(0);
    }

    play () {
        this.resumeCreative();
    }

    pause () {
        this.pauseCreative();
    }

    stop () {
        this.stopCreative();
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private sendImpressions (impressions: vast.Impression[]) {
        let impression;

        if (impressions.length === 0) {
            return;
        }

        for (let i = 0; i < impressions.length; i++) {
            impression = impressions[i];
            if (impression.uri && impression.uri.length > 0) {
                this.logger.debug('Send Impression, uri = ' + impression.uri);
                let http = new XMLHttpRequest();
                http.open('GET', impression.uri, true);
                http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                http.send();
            }
        }
    }

    private onCreativeEnd () {

        this.logger.debug('Creative ended');

        // Stop the current creative media
        this.stopCreative();

        // Play next creative
        this.playNextCreative();
    }

    private pauseCreative () {
        if (!this.creativePlayer) {
            return;
        }
        this.creativePlayer.pause();
    }

    private resumeCreative () {
        if (!this.creativePlayer) {
            return;
        }
        this.creativePlayer.play();
    }

    private stopCreative () {
        if (!this.creativePlayer) {
            return;
        }
        this.eventBus.removeEventListener('creativeEnd', this.onCreativeEndListener);
        this.creativePlayer.stop();
        this.creativePlayer = null;
    }

    private playCreative (index: number) {
        var creative = this.ad.inLine.creatives[index],
            linear;

        this.creativeIndex = index;
        this.logger.debug('Play Creative - index = ' + this.creativeIndex);

        // Play Linear element
        linear = creative.linear;

        if (linear) {
            this.logger.debug('Play Linear Ad, duration = ' + linear.duration);
            this.eventBus.addEventListener(EventTypes.CREATIVE_END, this.onCreativeEndListener);
            this.creativePlayer = new CreativePlayer(this.eventBus);
            if (!this.creativePlayer.init(creative.linear, this.adPlayerContainer, this.mainVideo, this.baseUrl)) {
                this.playNextCreative();
            }
        } else {
            this.playNextCreative();
        }
    }

    private playNextCreative () {

        this.creativeIndex++;

        if (this.creativeIndex < this.ad.inLine.creatives.length) {
            this.playCreative(this.creativeIndex);
        } else {
            // Notify end of Ad
            this.eventBus.dispatchEvent(AdEvents.AD_END);
        }
    }

    // #endregion PRIVATE FUNCTIONS
    // --------------------------------------------------

}

export default AdPlayer;
