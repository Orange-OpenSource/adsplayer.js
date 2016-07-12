/**
 * The ImagePlayer is a MediaPlayer implementation for playing still images.
 */
AdsPlayer.media.ImagePlayer = function() {

    var _uri = '',
        _image = null,
        _duration = 0,
        _currentTime = 0,
        _listeners = {},
        _timerInterval = null,
        _timerTime = -1,
        _events = ['play', 'pause', 'timeupdate', 'ended'],
        _debug = AdsPlayer.Debug.getInstance(),

        _getListeners = function (type) {
            if (!(type in _listeners)) {
                _listeners[type] = [];
            }
            return _listeners[type];
        },

        _addEventListener = function (type, listener) {
            var listeners = _getListeners(type),
                idx = listeners.indexOf(listener);

            if (idx === -1) {
                listeners.push(listener);
            }
        },

        _removeEventListener = function (type, listener) {
            var listeners = _getListeners(type),
                idx = listeners.indexOf(listener);

            if (idx !== -1) {
                listeners.splice(idx, 1);
            }
        },

        _notifyEvent = function (type) {
            var listeners = _getListeners(type),
                i = 0;

            for (i = 0; i < listeners.length; i++) {
                listeners[i].call(this);
            }
        },

        _updateCurrentTime = function () {
            var time = new Date().getTime();

            _currentTime += (time - _timerTime) / 1000;
            //_debug.log("Image timeupdate, time = " + _currentTime);
            _notifyEvent('timeupdate');

            if (_currentTime >= _duration) {
                _stopTimer();
                _notifyEvent('ended');                
            }

            _timerTime = time;
        },

        _startTimer = function () {
            if (_timerInterval !== null) {
                return;
            }
            _notifyEvent('play'); 
            _timerTime = new Date().getTime();
            _timerInterval = setInterval(_updateCurrentTime, 200);
        },

        _stopTimer = function () {
            if (_timerInterval === null) {
                return;
            }
            _notifyEvent('pause'); 
            clearInterval(_timerInterval);
            _timerInterval = null;
        };

    return {

        load : function (baseUrl, mediaFiles) {

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
            _image = document.getElementById('adsplayer-image');

            if (!_image) {
                // Create the image element
                _image = document.createElement('img');
                _image.autoplay = false;
                _image.id = 'adsplayer-image';
            }

            // Add base URL
            _uri = mediaFile.uri;
            _uri = (_uri.indexOf('http://') === -1) ? (baseUrl + _uri) : _uri;
            
            _debug.log("Load image media, uri = " + _uri);
            _image.src = _uri;

            // Reset current time
            _currentTime = 0;

            return true;
        },

        getType : function () {
            return "image";
        },

        getElement : function () {
            return _image;
        },

        addEventListener : function (type, listener) {
            if (!_image) {
                return;
            }
            if (_events.indexOf(type) !== -1) {
                _addEventListener(type, listener);
            } else {
                _image.addEventListener(type, listener);
            }
        },

        removeEventListener : function (type, listener) {
            if (!_image) {
                return;
            }
            if (_events.indexOf(type) !== -1) {
                _removeEventListener(type, listener);
            } else {
                _image.removeEventListener(type, listener);
            }
        },

        setDuration : function (duration) {
            _duration = duration;
        },

        getDuration : function () {
            return _duration;
        },

        getCurrentTime : function () {
            return _currentTime;
        },

        play : function () {
            if (!_image) {
                return;
            }
            _startTimer();
        },

        setVolume : function (volume) {
            // NA
        },

        pause : function () {
            if (!_image) {
                return;
            }
            _stopTimer();
        },

        stop : function () {
            if (!_image) {
                return;
            }
            _stopTimer();
        },

        reset : function () {
            if (!_image) {
                return;
            }
            _image = null;
            _listeners = {};
        }
    };
};

AdsPlayer.media.ImagePlayer.prototype = {
    constructor: AdsPlayer.media.ImagePlayer
};