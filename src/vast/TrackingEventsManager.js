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

import Debug from '../Debug';

class TrackingEventsManager {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _postEvent (uri) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send();
    }

    _addEventListener (element, eventType, trackingEvent) {

        let self = this,
            _listener = function(/*event*/) {
                if (this.completed === true) {
                    return;
                }
                if (this.uri === undefined || this.uri.length === 0) {
                    return;
                }
                if (this.condition && !this.condition()) {
                    return;
                }
                self._debug.log("Send tracking event " + this.event + ", uri = " + this.uri);
                self._postEvent(this.uri);
                if (this.oneShot === true) {
                    this.completed = true;
                }
            },
            _eventListener = {
                type: eventType,
                element: element,
                listener: _listener.bind(trackingEvent)
            };

        element.addEventListener(eventType, _eventListener.listener);
        this._eventListeners.push(_eventListener);
    }

    _addPlayerEventListeners () {

        for (let i = 0; i < this._trackingEvents.length; i++) {
            let trackingEvent = this._trackingEvents[i];
            if (trackingEvent.uri && trackingEvent.uri.length > 0) {
                switch (trackingEvent.event) {
                    case 'creativeView':
                        trackingEvent.oneShot = true;
                        this._addEventListener(this._adMediaPlayer, 'loadeddata', trackingEvent);
                        break;
                    case 'start':
                        trackingEvent.oneShot = true;
                        this._addEventListener(this._adMediaPlayer, 'playing', trackingEvent);
                        break;
                    case 'pause':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            // To ignore pause event that may be raised at end of stream
                            return (this._adMediaPlayer.isEnded() === false );
                        };
                        this._addEventListener(this._adMediaPlayer, 'pause', trackingEvent);
                        break;
                    case 'resume':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            return (this._adMediaPlayer.getCurrentTime() > 0);
                        };
                        this._addEventListener(this._adMediaPlayer, 'play', trackingEvent);
                        break;
                    case 'firstQuartile':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            //_debug.log("Progress: " + (this._adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((this._adMediaPlayer.getCurrentTime() / this._adMediaPlayer.getDuration()) >= 0.25);
                        };
                        this._addEventListener(this._adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'midpoint':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            //_debug.log("Progress: " + (this._adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((this._adMediaPlayer.getCurrentTime() / this._adMediaPlayer.getDuration()) >= 0.50);
                        };
                        this._addEventListener(this._adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'thirdQuartile':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            //_debug.log("Progress: " + (this._adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((this._adMediaPlayer.getCurrentTime() / this._adMediaPlayer.getDuration()) >= 0.75);
                        };
                        this._addEventListener(this._adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'rewind':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            let res = ((this._adMediaPlayer.getCurrentTime() < this._currentTime) && (this._adMediaPlayer.getElement()!==null));
                            this._currentTime = this._adMediaPlayer.getCurrentTime();
                            return res;
                        };
                        this._addEventListener(this._adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'complete':
                        this._addEventListener(this._adMediaPlayer, 'ended', trackingEvent);
                        break;
                    case 'mute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            let res = !this._mute && (this._adMediaPlayer.getVolume() === 0);
                            this._mute = (this._adMediaPlayer.getVolume() === 0);
                            return res;
                        };
                        this._addEventListener(this._adMediaPlayer, 'volumechange', trackingEvent);
                        break;
                    case 'unmute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            let res = !this._unmute && (this._adMediaPlayer.getVolume() > 0);
                            this._unmute = (this._adMediaPlayer.getVolume() > 0);
                            return res;
                        };
                        this._addEventListener(this._adMediaPlayer, 'volumechange', trackingEvent);
                        break;
                    case 'fullscreen':
                    case 'exitFullscreen':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = (event = trackingEvent.event) => {
                            let state = (event === 'fullscreen');
                            return (document.fullScreen === state || document.mozFullScreen === state || document.webkitIsFullScreen === state);
                        };
                        this._addEventListener(document, 'webkitfullscreenchange', trackingEvent);
                        this._addEventListener(document, 'mozfullscreenchange', trackingEvent);
                        this._addEventListener(document, 'MSFullscreenChange', trackingEvent);
                        this._addEventListener(document, 'fullscreenChange', trackingEvent);
                        break;
                    case 'progress':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = () => {
                            if (trackingEvent.offsetPercent) {
                                //this._debug.log("progress:" + this._adMediaPlayer.getCurrentTime()+" vs offsetPercent = " + trackingEvent.offsetPercent * this._adMediaPlayer.getDuration());
                                return (this._adMediaPlayer.getCurrentTime() >= trackingEvent.offsetPercent * this._adMediaPlayer.getDuration());
                            } else {
                                //this._debug.log("progress:" + this._adMediaPlayer.getCurrentTime()+" vs offsetInSeconds " + trackingEvent.offsetInSeconds);
                                return (this._adMediaPlayer.getCurrentTime() >= trackingEvent.offsetInSeconds);
                            }
                        };
                        this._addEventListener(this._adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'acceptInvitationLinear':
                        trackingEvent.oneShot = false;
                        this._addEventListener(this._adMediaPlayer, 'click', trackingEvent);
                        break;
                    case 'closeLinear':
                        trackingEvent.oneShot = false;
                        this._addEventListener(window, 'beforeunload', trackingEvent);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    _removePlayerEventListeners () {
        for (let i = 0; i < this._eventListeners.length; i++) {
            this._eventListeners[i].element.removeEventListener(this._eventListeners[i].type, this._eventListeners[i].listener);
        }
        this._eventListeners = [];
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._trackingEvents = null;
        this._adMediaPlayer = null;
        this._currentTime = -1;
        this._mute = -1;
        this._unmute = -1;
        this._debug = Debug.getInstance();
        this._eventListeners = [];
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
        this._trackingEvents = trackingEvents;
        this._adMediaPlayer = adMediaPlayer;
        this._mute = (this._adMediaPlayer.getVolume() === 0);
        this._unmute = (this._adMediaPlayer.getVolume() > 0);
    }

    start () {
        if (this._trackingEvents.length === 0) {
            return;
        }
        this._addPlayerEventListeners();
    }

    stop () {
        this._removePlayerEventListeners();
    }
}

export default TrackingEventsManager;
