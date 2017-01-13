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
* The ImagePlayer is a MediaPlayer implementation for playing still images.
*/

import Debug from '../Debug';

class ImagePlayer {

    _getListeners (type) {
        if (!(type in this._listeners)) {
            this._listeners[type] = [];
        }
        return this._listeners[type];
    }

    _addEventListener (type, listener) {
        var listeners = this._getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx === -1) {
            listeners.push(listener);
        }
    }

    _removeEventListener (type, listener) {
        var listeners = this._getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx !== -1) {
            listeners.splice(idx, 1);
        }
    }

    _notifyEvent (type) {
        var listeners = this._getListeners(type),
            i = 0;

        for (i = 0; i < listeners.length; i++) {
            listeners[i].call(this);
        }
    }

    _updateCurrentTime () {
        var time = new Date().getTime();

        this._currentTime += (time - this._timerTime) / 1000;
        //this._debug.log("Image timeupdate, time = " + this._currentTime);
        this._notifyEvent('timeupdate');

        if (this._currentTime >= this._duration) {
            this._stopTimer();
            this._ended = true;
            this._notifyEvent('ended');
        }

        this._timerTime = time;
    }

    _startTimer () {
        if (this._timerInterval !== null) {
            return;
        }
        this._notifyEvent('play');
        this._timerTime = new Date().getTime();
        this._timerInterval = setInterval(this._updateCurrentTime.bind(this), 200);
    }

    _stopTimer () {
        if (this._timerInterval === null) {
            return;
        }
        this._notifyEvent('pause');
        clearInterval(this._timerInterval);
        this._timerInterval = null;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {

        this._uri = '';
        this._image = null;
        this._duration = 0;
        this._currentTime = 0;
        this._ended = false;
        this._listeners = {};
        this._timerInterval = null;
        this._timerTime = -1;
        this._events = ['play', 'pause', 'timeupdate', 'ended'];
        this._debug = Debug.getInstance();
    }

    load (baseUrl, mediaFiles) {

        var mediaFile = null,
            type,
            i;

        // Load the first supported image format
        // Support only jpeg, png and gif image formats
        for (i = 0; i < mediaFiles.length; i++) {
            type = mediaFiles[i].type;
            if ((type === "image/jpeg") || (type === "image/jpg") || (type === "image/png") || (type === "image/gif")) {
                mediaFile = mediaFiles[i];
                break;
            }
        }

        if (mediaFile === null) {
            return false;
        }

        // Get adsplayer-image element if already declared in DOM
        this._image = document.getElementById('adsplayer-image');

        if (!this._image) {
            // Create the image element
            this._image = document.createElement('img');
            this._image.autoplay = false;
            this._image.id = 'adsplayer-image';
        }

        // Add base URL
        this._uri = mediaFile.uri;
        this._uri = (this._uri.indexOf('http://') === -1) ? (baseUrl + this._uri) : this._uri;

        this._debug.log("Load image media, uri = " + this._uri);
        this._image.src = this._uri;

        // Reset current time
        this._currentTime = 0;
        this._ended = false;

        return true;
    }

    getType () {
        return "image";
    }

    getElement () {
        return this._image;
    }

    addEventListener (type, listener) {
        if (!this._image) {
            return;
        }
        if (this._events.indexOf(type) !== -1) {
            this._addEventListener(type, listener);
        } else {
            this._image.addEventListener(type, listener);
        }
    }

    removeEventListener (type, listener) {
        if (!this._image) {
            return;
        }
        if (this._events.indexOf(type) !== -1) {
            this._removeEventListener(type, listener);
        } else {
            this._image.removeEventListener(type, listener);
        }
    }

    setDuration (duration) {
        this._duration = duration;
    }

    getDuration () {
        return this._duration;
    }

    getCurrentTime () {
        return this._currentTime;
    }

    setVolume (/*volume*/) {
        // NA
    }

    getVolume () {
        return 0;
    }

    play () {
        if (!this._image) {
            return;
        }
        this._startTimer();
    }

    pause () {
        if (!this._image) {
            return;
        }
        this._stopTimer();
    }

    stop () {
        if (!this._image) {
            return;
        }
        this._stopTimer();
    }

    reset () {
        if (!this._image) {
            return;
        }
        this._image = null;
        this._listeners = {};
    }

    isEnded () {
        return this._ended;
    }
}

export default ImagePlayer;
