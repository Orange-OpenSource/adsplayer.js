/**
 * The TrackingEventsManager manages the sending of the tracking events while
 * ad creative's media is playing.
 * It takes as input the list of tracking events to send Vast objects as returned by the VAST parser.
 * For each Vast, the AdsPlayerManager plays all Creatives contained in all Ads of the Vast.
 * A Vast can contain multiple Ads.
 * An Ad can contain multiple Creatives.
 * To play a Creative the AdsPlayerManageruses an AdsMediaPlayer object.
 */
AdsPlayer.TrackingEventsManager = function() {

    var _trackingEvents = [],
        _adMediaPlayer = null,
        _mute = false,
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance(),
        _eventListeners = [],

        _postEvent = function (uri) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', uri, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xhr.send();
        },

        _addEventListener = function (element, eventType, trackingEvent, condition) {

            var _listener = function (event) {
                    if (this.completed === true) {
                        return;
                    }
                    if (this.uri === undefined || this.uri.length === 0) {
                        return;
                    }
                    if (this.condition && !this.condition()) {
                        return;
                    }
                    _debug.log("Send tracking event " + this.event + ", uri = " + this.uri);
                    _postEvent(this.uri);
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
            _eventListeners.push(_eventListener);
        },

        _addPlayerEventListeners = function () {

            for (var i = 0; i < _trackingEvents.length; i++) {
                trackingEvent = _trackingEvents[i];
                switch (trackingEvent.event) {
                    case 'creativeView':
                        trackingEvent.oneShot = true;
                        _addEventListener(_adMediaPlayer, 'loadeddata', trackingEvent);
                        break;
                    case 'start':
                        trackingEvent.oneShot = true;
                        _addEventListener(_adMediaPlayer, 'playing', trackingEvent);
                        break;
                    case 'pause':
                        trackingEvent.oneShot = false;
                        _addEventListener(_adMediaPlayer, 'paused', trackingEvent);
                        break;
                    case 'resume':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = function () {
                            return (_adMediaPlayer.getCurrentTime() > 0);
                        };
                        _addEventListener(_adMediaPlayer, 'play', trackingEvent);
                        break;
                    case 'complete':
                        _addEventListener(_adMediaPlayer, 'ended', trackingEvent);
                        break;
                    case 'firstQuartile':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = function () {
                            //_debug.log("Progress: " + (_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()) >= 0.25);
                        };
                        _addEventListener(_adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'midpoint':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = function () {
                            //_debug.log("Progress: " + (_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()) >= 0.50);
                        };
                        _addEventListener(_adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'thirdQuartile':
                        trackingEvent.oneShot = true;
                        trackingEvent.condition = function () {
                            //_debug.log("Progress: " + (_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()));
                            return ((_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()) >= 0.75);
                        };
                        _addEventListener(_adMediaPlayer, 'timeupdate', trackingEvent);
                        break;
                    case 'mute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = function () {
                            _mute = (_mute === false) & (_adMediaPlayer.volume === 0);
                            return _mute;
                        };
                        _addEventListener(_adMediaPlayer, 'volumechanged', trackingEvent);
                        break;
                    case 'unmute':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = function () {
                            _mute = (_mute === true) & (_adMediaPlayer.volume > 0);
                            return _mute;
                        };
                        _addEventListener(_adMediaPlayer, 'volumechanged', trackingEvent);
                        break;
                    case 'fullscreen':
                        trackingEvent.oneShot = false;
                        trackingEvent.condition = function () {
                            return (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen);
                        };
                        _addEventListener(document, 'webkitfullscreenchange', trackingEvent);
                        _addEventListener(document, 'mozfullscreenchange', trackingEvent);
                        _addEventListener(document, 'MSFullscreenChange', trackingEvent);
                        _addEventListener(document, 'fullscreenChange', trackingEvent);
                        break;
                    default:
                        break;
                }
            }
        },

        _removePlayerEventListeners = function () {
            for (var i = 0; i < _eventListeners.length; i++) {
                _eventListeners[i].element.removeEventListener(_eventListeners[i].type, _eventListeners[i].listener);
            }
            _eventListeners = [];
        };


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    return {

        /**
         * Initializes the TrackingEventsManager.
         * @method init
         * @access public
         * @memberof TrackingEventsManager#
         * @param {Array} trackingEvents - the array of tracking events to manage
         * @param {Object} adMediaPlayer - the ad media player
         */        
        init: function(trackingEvents, adMediaPlayer) {
            _trackingEvents = trackingEvents;
            _adMediaPlayer = adMediaPlayer;
            _mute = (_adMediaPlayer.volume === 0);
        },

        start: function() {
            if (_trackingEvents.length === 0) {
                return;
            }
            _addPlayerEventListeners();
        },

        stop: function() {
            _removePlayerEventListeners();
        }

    };

};

AdsPlayer.TrackingEventsManager.prototype = {
    constructor: AdsPlayer.TrackingEventsManager
};