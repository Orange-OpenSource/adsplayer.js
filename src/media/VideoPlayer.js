
/**
 * The VideoPlayer is a MediaPlayer implementation for playing video files.
 */

AdsPlayer.media.VideoPlayer = function() {

    var _uri = '',
        _video = null,
        _debug = AdsPlayer.Debug.getInstance(),

        isMediaSupported = function (mimeType) {
            if (!_video) {
                throw "isMediaSupported(): element not created";
            }
            if (!(_video instanceof HTMLMediaElement)) {
                throw "isMediaSupported(): element must be of type HTMLMediaElement";
            }

            var canPlay = _video.canPlayType(mimeType);
            return (canPlay === "probably" || canPlay === "maybe");
        };

    return {

        load : function (baseUrl, mediaFiles) {


            // Get 'adsplayer-video' element if already declared in DOM
            _video = document.getElementById('adsplayer-video');

            if (!_video) {
                // Create the video element
                _video = document.createElement('video');
                _video.autoplay = false;
                _video.id = 'adsplayer-video';
            }

            // Check if input format is supported
            if (!isMediaSupported(mediaFiles[0].type)) {
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
            _uri = mediaFiles[0].uri;

            // Add base URL
            _uri = (_uri.indexOf('http://') === -1) ? (baseUrl + _uri) : _uri;

            _debug.log("Load video media, uri = " + _uri);

            _video.addEventListener('error', function(e) {
                console.log(e);
            });

            _video.src = _uri;

            return true;
        },

        getElement : function () {
            return _video;
        },

        addEventListener : function (type, listener) {
            if (!_video) {
                return;
            }
            _video.addEventListener(type, listener);
        },

        removeEventListener : function (type, listener) {
            if (!_video) {
                return;
            }
            _video.removeEventListener(type, listener);
        },

        setDuration : function (duration) {
            // duration is handled by the video element
        },

        getDuration : function () {
            if (!_video) {
                return 0;
            }
            return _video.duration;
        },

        getCurrentTime : function () {
            if (!_video) {
                return 0;
            }
            return _video.currentTime;
        },

        play : function () {
            if (!_video) {
                return;
            }
            _video.play();
        },

        stop : function () {
            if (!_video) {
                return;
            }
            _video.pause();
        },

        pause : function () {
            if (!_video) {
                return;
            }
            _video.pause();
        },

        reset : function () {
            if (!_video) {
                return;
            }
            _video = null;
        }
    };
};

AdsPlayer.media.VideoPlayer.prototype = {
    constructor: AdsPlayer.media.VideoPlayer
};