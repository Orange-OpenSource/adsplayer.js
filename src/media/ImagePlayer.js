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

    play () {
        if (!this._image) {
            return;
        }
        this._startTimer();
    }

    setVolume (/*volume*/) {
        // NA
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
}

export default ImagePlayer;
