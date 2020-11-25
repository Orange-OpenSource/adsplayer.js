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
* The TrackingEventsManager manages the sending of the tracking events while a creative's media is playing.
* It takes as input the list of tracking events to send.
*/

import * as vast from './model/Vast'
import { Logger } from '../Logger';

export class TrackingEventsManager {

    // #region MEMBERS
    // --------------------------------------------------

    private trackingEvents: vast.TrackingEvent[];
    private adMediaPlayer;
    private currentTime: number;
    private mute: boolean;
    private unmute: boolean ;
    private debug;
    private eventListeners: any[];


    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
        this.trackingEvents = null;
        this.adMediaPlayer = null;
        this.currentTime = -1;
        this.mute = false;
        this.unmute = false;
        this.debug = Logger.getInstance();
        this.eventListeners = [];
    }

    /**
     * Initializes the TrackingEventsManager.
     * @method init
     * @access public
     * @memberof TrackingEventsManager#
     * @param {Array} trackingEvents - the array of tracking events to manage
     * @param {Object} adMediaPlayer - the ad media player
     */
    init (trackingEvents, adMediaPlayer) {
        this.trackingEvents = trackingEvents;
        this.adMediaPlayer = adMediaPlayer;
        this.mute = (this.adMediaPlayer.getVolume() === 0);
        this.unmute = (this.adMediaPlayer.getVolume() > 0);
    }

    start () {
        if (this.trackingEvents.length === 0) {
            return;
        }
        this.addPlayerEventListeners();
    }

    stop () {
        this.removePlayerEventListeners();
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private postEvent (uri) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send();
    }

    private addEventListener (element, eventType, trackingEvent: vast.TrackingEvent) {

        let self = this,
            _listener = function(/*event*/) {
                if (this.completed) {
                    return;
                }
                if (this.uri === undefined || this.uri.length === 0) {
                    return;
                }
                if (this.condition && !this.condition()) {
                    return;
                }
                self.debug.log('Send tracking event ' + this.event + ', uri = ' + this.uri);
                self.postEvent(this.uri);
                if (this.oneShot) {
                    this.completed = true;
                }
            },
            _eventListener = {
                type: eventType,
                element: element,
                listener: _listener.bind(trackingEvent)
            };

        element.addEventListener(eventType, _eventListener.listener);
        this.eventListeners.push(_eventListener);
    }

    private addPlayerEventListeners () {

        for (let i = 0; i < this.trackingEvents.length; i++) {
            let trackingEvent = this.trackingEvents[i];
            trackingEvent.completed = false;
            if (trackingEvent.uri && trackingEvent.uri.length > 0) {
                switch (trackingEvent.event) {
                    case 'creativeView':
                        trackingEvent.oneShot = true;
                        this.addEventListener(this.adMediaPlayer, 'loadeddata', trackingEvent);
                        break;
                    case 'start':
                        trackingEvent.oneShot = true;
                        this.addEventListener(this.adMediaPlayer, 'playing', trackingEvent);
                        break;
                    case 'pause':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            // To ignore pause event that may be raised at end of stream
                            return (this.adMediaPlayer.isEnded() === false );
                        };
                        this.addEventListener(this.adMediaPlayer, 'pause', trackingEvent);
                        break;
                    case 'resume':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            return (this.adMediaPlayer.getCurrentTime() > 0);
                        };
                        this.addEventListener(this.adMediaPlayer, 'play', trackingEvent);
                        break;
                    case 'firstQuartile':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            //_debug.log('Progress: ' + (this.adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((this.adMediaPlayer.getCurrentTime() / this.adMediaPlayer.getDuration()) >= 0.25);
                        };
                        this.addEventListener(this.adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'midpoint':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            //_debug.log('Progress: ' + (this.adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((this.adMediaPlayer.getCurrentTime() / this.adMediaPlayer.getDuration()) >= 0.50);
                        };
                        this.addEventListener(this.adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'thirdQuartile':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            //_debug.log('Progress: ' + (this.adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((this.adMediaPlayer.getCurrentTime() / this.adMediaPlayer.getDuration()) >= 0.75);
                        };
                        this.addEventListener(this.adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'rewind':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            let res = ((this.adMediaPlayer.getCurrentTime() < this.currentTime) && (this.adMediaPlayer.isEnded() === false));
                            this.currentTime = this.adMediaPlayer.getCurrentTime();
                            return res;
                        };
                        this.addEventListener(this.adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'complete':
                        this.addEventListener(this.adMediaPlayer, 'ended', trackingEvent);
                        break;
                    case 'mute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            let res = !this.mute && (this.adMediaPlayer.getVolume() === 0);
                            this.mute = (this.adMediaPlayer.getVolume() === 0);
                            return res;
                        };
                        this.addEventListener(this.adMediaPlayer, 'volumechange', trackingEvent);
                        break;
                    case 'unmute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            let res = !this.unmute && (this.adMediaPlayer.getVolume() > 0);
                            this.unmute = (this.adMediaPlayer.getVolume() > 0);
                            return res;
                        };
                        this.addEventListener(this.adMediaPlayer, 'volumechange', trackingEvent);
                        break;
                    case 'fullscreen':
                    case 'exitFullscreen':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = (event = trackingEvent.event) => {
                            let state = (event === 'fullscreen');
                            return (document['fullscreen'] === state || document['mozFullScreen'] === state || document['webkitIsFullScreen'] === state);
                        };
                        this.addEventListener(document, 'webkitfullscreenchange', trackingEvent);
                        this.addEventListener(document, 'mozfullscreenchange', trackingEvent);
                        this.addEventListener(document, 'MSFullscreenChange', trackingEvent);
                        this.addEventListener(document, 'fullscreenChange', trackingEvent);
                        break;
                    case 'progress':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            if (trackingEvent.offsetPercent) {
                                //this.debug.log('progress:' + this.adMediaPlayer.getCurrentTime()+' vs offsetPercent = ' + trackingEvent.offsetPercent * this.adMediaPlayer.getDuration());
                                return (this.adMediaPlayer.getCurrentTime() >= trackingEvent.offsetPercent * this.adMediaPlayer.getDuration());
                            } else {
                                //this.debug.log('progress:' + this.adMediaPlayer.getCurrentTime()+' vs offsetInSeconds ' + trackingEvent.offsetInSeconds);
                                return (this.adMediaPlayer.getCurrentTime() >= trackingEvent.offsetInSeconds);
                            }
                        };
                        this.addEventListener(this.adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'acceptInvitationLinear':
                        trackingEvent.oneShot = false;
                        this.addEventListener(this.adMediaPlayer, 'click', trackingEvent);
                        break;
                    case 'closeLinear':
                        trackingEvent.oneShot = false;
                        this.addEventListener(window, 'beforeunload', trackingEvent);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private removePlayerEventListeners () {
        for (let i = 0; i < this.eventListeners.length; i++) {
            this.eventListeners[i].element.removeEventListener(this.eventListeners[i].type, this.eventListeners[i].listener);
        }
        this.eventListeners = [];
    }


}

export default TrackingEventsManager;
