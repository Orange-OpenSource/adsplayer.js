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
                        this._addEventListener(this._adMediaPlayer, 'paused', trackingEvent);
                        break;
                    case 'resume':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            return (this._adMediaPlayer.getCurrentTime() > 0);
                        };
                        this._addEventListener(this._adMediaPlayer, 'play', trackingEvent);
                        break;
                    case 'complete':
                        this._addEventListener(this._adMediaPlayer, 'ended', trackingEvent);
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
                    case 'mute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            this._mute = (this._mute === false) & (this._adMediaPlayer.volume === 0);
                            return this._mute;
                        };
                        this._addEventListener(this._adMediaPlayer, 'volumechanged', trackingEvent);
                        break;
                    case 'unmute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            this._mute = (this._mute === true) & (this._adMediaPlayer.volume > 0);
                            return this._mute;
                        };
                        this._addEventListener(this._adMediaPlayer, 'volumechanged', trackingEvent);
                        break;
                    case 'fullscreen':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = () => {
                            return (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen);
                        };
                        this._addEventListener(document, 'webkitfullscreenchange', trackingEvent);
                        this._addEventListener(document, 'mozfullscreenchange', trackingEvent);
                        this._addEventListener(document, 'MSFullscreenChange', trackingEvent);
                        this._addEventListener(document, 'fullscreenChange', trackingEvent);
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
        this._mute = false;
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
        this._mute = (this._adMediaPlayer.volume === 0);
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
