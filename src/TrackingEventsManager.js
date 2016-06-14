
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

        _postEvent = function (uri) {
            if (uri === "") {
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.open('GET', uri, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xhr.send();
        },

        _addEventListener = function (element, type, callback, once) {
            var _cb = function() {
                if (once && typeof once === "boolean") {
                    element.removeEventListener(type, _cb, false);
                }
                callback();
            };
            element.addEventListener(type, _cb, false);
            _listeners.push({
                element: element,
                type: type,
                callback: _cb
            });

        },

        _listenPlayerEvents = function () {


            for (i = 0; i < _trackingEvents.length; i++) {
                trackingEvent = _trackingEvents[i];
                switch (trackingEvent.event) {
                    case 'start':
                        _addEventListener(_adMediaPlayer, 'playing', _postFunction(trackingEvent.uri), true);
                        break;
                    case 'complete':
                        _addEventListener(_adMediaPlayer, 'ended', _postFunction(trackingEvent.uri, true));
                        break;
                    case 'creativeView':
                        _addEventListener(_adMediaPlayer, 'loadeddata', _postFunction(trackingEvent.uri), true);
                        break;
                    case 'firstQuartile':
                    case 'thirdQuartile':
                    case 'midpoint':
                        myEvent = new AdsPlayer.AdsTrackingEvents.ProgressEvent();
                        myEvent.trackingEvent = trackingEvent;
                        _trackingProgressEvents.push(myEvent);
                        timeUpdateFlag = true;
                        break;
                    case 'mute':
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
                        break;
                }
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

            _listenPlayerEvents();
        },

        stop: function() {

        }

    };

};

AdsPlayer.TrackingEventsManager.prototype = {
    constructor: AdsPlayer.TrackingEventsManager
};