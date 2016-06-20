
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


        _addEventListener = function (eventType, trackingEvent, condition) {

            var _listener = function (event) {
                    if (this.completed === true) {
                        return;
                    }
                    if (this.uri === undefined || this.uri.length === 0) {
                        return;
                    }
                    if (!condition()) {
                        return;
                    }
                    _postEvent(this.uri);
                    if (this.oneShot === true) {
                        this.completed = true;
                    }
                },
                _eventListener = {
                    type: eventType,
                    listener: _listener.bind(trackingEvent)
                };

            _adMediaPlayer.addEventListener(eventType, _eventListener.listener);
            _eventListeners.push(_eventListener);
        },

        _addPlayerEventListeners = function () {

            for (var i = 0; i < _trackingEvents.length; i++) {
                trackingEvent = _trackingEvents[i];
                switch (trackingEvent.event) {
                    case 'start':
                        trackingEvent.oneShot = true;
                        _addEventListener('playing', trackingEvent);
                        break;
                    case 'complete':
                        trackingEvent.oneShot = true;
                        _addEventListener('ended', trackingEvent);
                        break;
                    case 'creativeView':
                        trackingEvent.oneShot = true;
                        _addEventListener('loadeddata', trackingEvent);
                        break;
                    case 'firstQuartile':
                        trackingEvent.oneShot = true;
                        _addEventListener('timeupdate', trackingEvent, function () {
                            return ((_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()) >= 0.25);
                        });
                        break;
                    case 'midpoint':
                        trackingEvent.oneShot = true;
                        _addEventListener('timeupdate', trackingEvent, function () {
                            return ((_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()) >= 0.50);
                        });
                        break;
                    case 'thirdQuartile':
                        trackingEvent.oneShot = true;
                        _addEventListener('timeupdate', trackingEvent, function () {
                            return ((_adMediaPlayer.getCurrentTime() / _adMediaPlayer.getDuration()) >= 0.75);
                        });
                        break;
                    /*case 'mute':
                        uriMute = trackingEvent.uri;
                        break;
                    case 'unmute':
                        uriUnmute = trackingEvent.uri;
                        break;
                    case 'pause':
                        _addEventListener(_adMediaPlayer, 'pause', _CB_Pause(trackingEvent.uri));
                        break;
                    case 'resume':
                        _addEventListener(_adMediaPlayer, 'play', _CB_Resume(trackingEvent.uri));
                        break;
                    case 'fullscreen':
                        _addFullScreenListener(trackingEvent.uri);
                        break;*/
                }
            }

        },

        _removePlayerEventListeners = function () {

            for (var i = 0; i < _eventListeners.length; i++) {
                _adMediaPlayer.addEventListener(_eventListeners[i].type, _eventListeners[i].listener);
            }
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