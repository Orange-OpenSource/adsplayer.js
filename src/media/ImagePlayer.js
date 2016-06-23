
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
        _startTime = -1,
        _debug = AdsPlayer.Debug.getInstance(),
        _style = {
            'display': 'block',
            'position': 'absolute',
            'transform': 'translate(-50%,-50%)',
            'top': '50%',
            'left': '50%'
        },

        _setStyle = function (element, style) {
            for (var property in style) {
                element.style[property] = style[property];
            }
        },

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

            _currentTime = (time - _startTime) / 1000;
            //_debug.log("Image display timeupdate, time = " + _currentTime);
            _notifyEvent('timeupdate');

            if (_currentTime >= _duration) {
                _stopTimer();
                _debug.log("Image display ended");
                _notifyEvent('ended');                
            }
        },

        _startTimer = function () {
            if (_timerInterval !== null) {
                return;
            }
            _startTime = new Date().getTime();
            _timerInterval = setInterval(_updateCurrentTime, 100);
        },

        _stopTimer = function () {
            if (_timerInterval === null) {
                return;
            }
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
                if ((type === "image/jpeg") || (type === "image/png") || (type === "image/gif")) {
                    mediaFile = mediaFiles[i];
                    break;
                }
            }

            if (mediaFile === null) {
                return false;
            }

            // Create the image element
            _image = document.createElement('img');
            _image.autoplay = false;
            _image.id = 'adsplayer-image';
            _setStyle(_image, _style);

            // Add base URL
            _uri = mediaFile.uri;
            _uri = (_uri.indexOf('http://') === -1) ? (baseUrl + _uri) : _uri;
            
            _debug.log("Load image media, uri = " + _uri);
            _image.src = _uri;

            return true;
        },

        getElement : function () {
            return _image;
        },

        addEventListener : function (type, listener) {
            if (!_image) {
                return;
            }
            if ((type === 'timeupdate') || (type === 'ended')) {
                _addEventListener(type, listener);
            } else {
                _image.addEventListener(type, listener);
            }
        },

        removeEventListener : function (type, listener) {
            if (!_image) {
                return;
            }
            if ((type === 'timeupdate') || (type === 'ended')) {
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
            _image.src = "";
            _image = null;
            _listeners = {};
        }
    };
};

AdsPlayer.media.ImagePlayer.prototype = {
    constructor: AdsPlayer.media.ImagePlayer
};