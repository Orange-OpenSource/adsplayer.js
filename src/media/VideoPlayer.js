/**
* The VideoPlayer is a MediaPlayer implementation for playing video files.
*/

import Debug from '../Debug';

class VideoPlayer {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    isMediaSupported (mimeType) {
        if (!this._video) {
            throw "isMediaSupported(): element not created";
        }
        if (!(this._video instanceof HTMLMediaElement)) {
            throw "isMediaSupported(): element must be of type HTMLMediaElement";
        }

        var canPlay = this._video.canPlayType(mimeType);
        return (canPlay === "probably" || canPlay === "maybe");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._uri = '';
        this._video = null;
        this._debug = Debug.getInstance();
    }

    load (baseUrl, mediaFiles) {

        // Get 'adsplayer-video' element if already declared in DOM
        this._video = document.getElementById('adsplayer-video');

        if (!this._video) {
            // Create the video element
            this._video = document.createElement('video');
            this._video.autoplay = false;
            this._video.id = 'adsplayer-video';
        }

        // Check if input format is supported
        if (!this.isMediaSupported(mediaFiles[0].type)) {
            return false;
        }

        // Sort the mediafiles in bitrate ascending order
        mediaFiles.sort(function(a, b) {
            if (a.bitrate && b.bitrate) {
                return a.bitrate - b.bitrate;
            }
            return -1;
        });

        // Play the media file with lowest bitrate
        this._uri = mediaFiles[0].uri;

        // Add base URL
        this._uri = (this._uri.indexOf('http://') === -1) ? (baseUrl + this._uri) : this._uri;

        this._debug.log("Load video media, uri = " + this._uri);

        this._video.addEventListener('error', function(e) {
            console.log(e);
        });

        this._video.src = this._uri;

        return true;
    }

    getType () {
        return "video";
    }

    getElement () {
        return this._video;
    }

    addEventListener (type, listener) {
        if (!this._video) {
            return;
        }
        this._video.addEventListener(type, listener);
    }

    removeEventListener (type, listener) {
        if (!this._video) {
            return;
        }
        this._video.removeEventListener(type, listener);
    }

    setDuration (/*duration*/) {
        // duration is handled by the video element
    }

    getDuration () {
        if (!this._video) {
            return 0;
        }
        return this._video.duration;
    }

    getCurrentTime () {
        if (!this._video) {
            return 0;
        }
        return this._video.currentTime;
    }

    getVolume () {
        if (!this._video) {
            return 0;
        }
        return this._video.muted ? 0 : this._video.volume;
    }

    setVolume (volume) {
        if (!this._video) {
            return;
        }
        this._video.volume = volume;
    }

    play () {
        if (!this._video) {
            return;
        }
        this._video.play();
    }

    stop () {
        if (!this._video) {
            return;
        }
        this._video.pause();
    }

    pause () {
        if (!this._video) {
            return;
        }
        this._video.pause();
    }

    reset () {
        if (!this._video) {
            return;
        }
        this._video = null;
    }
}

export default VideoPlayer;
