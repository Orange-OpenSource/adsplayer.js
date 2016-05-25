/*

What is implemented : tracking requests for :
    Ad Start : Fired when the video or overlay begins moving (shortly after the impression).
    Ad First Quartile : Fired at the 25% point of the video or overlay duration.
    Ad Mid Point : Fired at the middle of the video or overlay duration.
    Ad Third Quartile : Fired at the 75% point of the video or overlay duration.
    Ad Complete : Fired at the end of the video or overlay.
    Ad Creative View : Fired when a creative element is displayed.
    Ad Mute : Fired when the video is muted.
    Ad Unmute : Fired when the video is changed from muted to unmuted.
    Ad Pause : Fired when the video is paused.
    Ad Resume : Fired when the video is resumed after being paused.
    Ad Full Screen : Fired when the player is switched to full screen mode.
*/


var TrackingEventType = {
    START: 'start',
    FIRST_QUARTILE: 'firstQuartile',
    THIRD_QUARTILE: 'thirdQuartile',
    MID_POINT: 'midpoint',
    COMPLETE: 'complete',
    CREATIVE_VIEW: 'creativeView',
    MUTE: 'mute',
    UNMUTE: 'unmute',
    PAUSE: 'pause',
    RESUME: 'resume',
    FULLSCREEN: 'fullscreen'
};

AdsPlayer.AdsTrackingEvents = function(adsContainer, adsVideoPlayer) {
    var _adsVideoPlayer = adsVideoPlayer,
        _adsContainer = adsContainer,
        _debug = AdsPlayer.Debug.getInstance(),
        _trackingProgressEvents = [],
        _eventBus = AdsPlayer.EventBus.getInstance(),
        _listeners = [],
        _isPaused,
        _isMuted,

        _init = function(trackingEvents) {
            var i,
                trackingEvent,
                myEvent,
                timeUpdateFlag = false,
                uriMute = '',
                uriUnmute = '';

            _reset();

            _isPaused = _adsVideoPlayer.paused;
            _isMuted = _adsVideoPlayer.muted || (_adsVideoPlayer.volume === 0.0 ? true : false);

            for (i = 0; i < trackingEvents.length; i++) {
                trackingEvent = trackingEvents[i];
                switch (trackingEvent.event) {
                    case 'start':
                        _addEventListener(_adsVideoPlayer, 'playing', trackingEvent.uri);
                        break;
                    case 'complete':
                        _addEventListener(_adsVideoPlayer, 'ended', trackingEvent.uri);
//                        _adsVideoPlayer.addEventListener('ended', _postFunction(trackingEvent.uri),false);
                        break;
                    case 'creativeView':
                        _addEventListener(_adsVideoPlayer, 'loadeddata', trackingEvent.uri);
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
                        _addEventListener(_adsVideoPlayer, 'pause', '', _CB_Pause(trackingEvent.uri));
                        break;
                    case 'resume':
                        _addEventListener(_adsVideoPlayer, 'play', '', _CB_Resume(trackingEvent.uri));
                        break;
                    case 'fullscreen':
                        _addFullScreenListener(trackingEvent.uri);
                        break;
                }
            }

            if (uriMute !== '' || uriUnmute !== '') {
                _addEventListener(_adsVideoPlayer, 'volumechange', '', _CB_MuteUnmute(uriMute, uriUnmute));
            }

            if (timeUpdateFlag) {
                _addEventListener(_adsVideoPlayer, 'timeupdate', '', _CB_Progress);
            }

            //   _testFullScreen();
            _testPlayPause();
            //_testMuteUnute();
        },

        _postFunction = function(uri) {
            var _uri = uri;
            var postFn = function() {
                _trackingUrl('POST', _uri);
            }.bind(this);
            return postFn;
        },

        _addEventListener = function(element, type, uri, callback) {
            if (callback === undefined || callback === null) {
                callback = _postFunction(uri);
            }
            element.addEventListener(type, callback, false);
            _listeners.push({
                element: element,
                type: type,
                callback: callback
            });
        },

        _CB_MuteUnmute = function(uriMute, uriUnmute) {
            var _uriMute = uriMute,
                _uriUnmute = uriUnmute;

            var cb = function() {
                var currentState;
                _debug.log('Mute/Unmute CB ');
                currentState = _adsVideoPlayer.muted || (_adsVideoPlayer.volume === 0.0 ? true : false);
                if (!currentState) {
                    if (_isMuted && _uriUnmute !== '') {
                        _trackingUrl('POST', _uriUnmute);
                    }
                } else {
                    if (!_isMuted && _uriMute !== '') {
                        _trackingUrl('POST', _uriMute);
                    }
                }
                _isMuted = currentState;
            }.bind(this);
            return cb;
        },

        _CB_Pause = function(uri) {
            var _uri = uri;
            var cb = function() {
                _debug.log('pause CB ');
                if (!_isPaused) { //if already in pause ==> do nothing
                    _trackingUrl('POST', _uri);
                    _isPaused = _adsVideoPlayer.paused;
                }
            }.bind(this);
            return cb;
        },

        _CB_Resume = function(uri) {
            var _uri = uri;
            var cb = function() {
                _debug.log('resume CB ');
                if (_isPaused) { //if already not in pause ==> do nothing
                    _trackingUrl('POST', _uri);
                    _isPaused = _adsVideoPlayer.paused;
                }
            }.bind(this);
            return cb;
        },

        _CB_FullScreen = function(uri) {
            var _uri = uri;
            var isFullScreen;
            var cb = function() {
                _debug.log('full screen CB ');
                isFullScreen = document.fullScreen ||
                    document.mozFullScreen ||
                    document.webkitIsFullScreen;
                if (isFullScreen) {
                    _trackingUrl('POST', _uri);
                }
            }.bind(this);
            return cb;
        },

        _addFullScreenListener = function(uri) {
            _addEventListener(document, 'webkitfullscreenchange', uri, _CB_FullScreen(uri));
            _addEventListener(document, 'mozfullscreenchange', uri, _CB_FullScreen(uri));
            _addEventListener(document, 'MSFullscreenChange', uri, _CB_FullScreen(uri));
            _addEventListener(document, 'fullscreenChange', uri, _CB_FullScreen(uri));
        },

        _check = function(ratio) {
            var i,
                trackingProgressEvent;
            for (i = 0; i < _trackingProgressEvents.length; i++) {
                trackingProgressEvent = _trackingProgressEvents[i];
                if (trackingProgressEvent.checked) {
                    continue;
                }
                switch (trackingProgressEvent.trackingEvent.event) {
                    case 'firstQuartile':
                        if (ratio >= 0.25) {
                            _trackingUrl('POST', trackingProgressEvent.trackingEvent.uri);
                            trackingProgressEvent.checked = true;
                        }
                        break;
                    case 'thirdQuartile':
                        if (ratio >= 0.75) {
                            _trackingUrl('POST', trackingProgressEvent.trackingEvent.uri);
                            trackingProgressEvent.checked = true;
                        }
                        break;
                    case 'midpoint':
                        if (ratio >= 0.50) {
                            _trackingUrl('POST', trackingProgressEvent.trackingEvent.uri);
                            trackingProgressEvent.checked = true;
                        }
                        break;
                }
            }
        },


        _CB_Progress = function() {
            var ratio;
            ratio = _adsVideoPlayer.currentTime / _adsVideoPlayer.duration;
            _check(ratio);
        },

        _removeListeners = function() {
            var i;
            for (i = 0; i < _listeners.length; i++) {
                _listeners[i].element.removeEventListener(_listeners[i].type, _listeners[i].callback);
            }
            _listeners = [];
        },

        _reset = function() {

            _removeListeners();
            _trackingProgressEvents = [];

        },

        _trackingUrl = function(type, uri, callback) {

            var http;

            if (uri === "") {
                return;
            }

            http = new XMLHttpRequest();

            http.open(type, uri, true);
            http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            http.timeout = 2000;

            http.onloadend = http.onerror = function() {
                if (callback) {
                    callback(http.status, http.response);
                }
            };

            if (type === 'GET') {
                http.send();
            } else {
                _debug.log('post to  ' + uri);
                http.send();
            }

        },

        _toggle = function(e) {
            if (e.requestFullscreen) {
                e.requestFullscreen();
            } else if (e.mozRequestFullScreen) {
                e.mozRequestFullScreen();
            } else if (e.webkitRequestFullscreen) {
                e.webkitRequestFullscreen();
            } else if (e.msRequestFullscreen) {
                e.msRequestFullscreen();
            }
        },

        _testFullScreen = function() {
            _adsVideoPlayer.addEventListener('click', function() {
                var ratio;
                var flag = true;
                if (flag) {
                    flag = false;
                    _toggle(_adsContainer);
                }
            }, false);

        },

        _testPlayPause = function() {
            _adsVideoPlayer.addEventListener('click', function() {
                var paused = _adsVideoPlayer.paused;
                if (paused) {
                    _adsVideoPlayer.play();
                } else {
                    _adsVideoPlayer.pause();
                }

            }, false);
        },


        _testMuteUnute = function() {
            _adsVideoPlayer.addEventListener('click', function() {
                var volume = _adsVideoPlayer.volume;
                if (volume === 0.0) {
                    _adsVideoPlayer.volume = 1.0;
                } else {
                    _adsVideoPlayer.volume = 0.0;
                }

            }, false);
        },

        _testMuteUnute1 = function() {
            _adsVideoPlayer.addEventListener('click', function() {
                if (_adsVideoPlayer.muted) {
                    _adsVideoPlayer.muted = false;
                } else {
                    _adsVideoPlayer.muted = true;
                }

            }, false);
        };


    return {
        init: _init,
        reset: _reset,
    };
};

AdsPlayer.AdsTrackingEvents.ProgressEvent = function() {
    this.checked = false;
    this.trackingEvent = null;
};


AdsPlayer.AdsTrackingEvents.prototype = {
    constructor: AdsPlayer.AdsTrackingEvents
};