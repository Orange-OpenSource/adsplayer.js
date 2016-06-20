
/**
 * The AdsPlayerManager manages the sequencing of playing ads.
 * It takes as input the list of Vast objects as returned by the VAST parser.
 * For each Vast, the AdsPlayerManager plays all Creatives contained in all Ads of the Vast.
 * A Vast can contain multiple Ads.
 * An Ad can contain multiple Creatives.
 * To play a Creative the AdsPlayerManageruses an AdsMediaPlayer object.
 */
AdsPlayer.AdsPlayerManager = function() {

    var _vasts = [],
        _adPlayer = null,
        _vastIndex = -1,
        _creativeIndex = -1,
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance(),
        _mediaPlayer = null,
        _trackingEventsManager = null,

        _onMediaEnded = function () {
            // Stop the MediaPlayer
            _mediaPlayer.stop();
            _mediaPlayer.reset();
            _mediaPlayer = null;

            // Stop the TrackingEvents manager
            if (_trackingEventsManager) {
                _trackingEventsManager.stop();
                _trackingEventsManager = null;
            }

            // Play next creative
            _playNextCreative();
        },

        _playMedia = function (baseUrl, mediaFiles, trackingEvents) {
            var mediaFile,
                isVideo,
                isImage;

            if (mediaFiles.length === 0) {
                return;
            }

            mediaFile = mediaFiles[0];

            // Video or image media ?
            isVideo = mediaFile.type.indexOf('video') !== -1; 
            isImage = mediaFile.type.indexOf('image') !== -1;

            if (isVideo) {
                _mediaPlayer = new AdVideoPlayer();
            }
            if (isImage) {
                //_mediaPlayer = new AdImagePlayer();
            }

            if (trackingEvents) {
                _trackingEventsManager = new AdsPlayer.TrackingEventsManager();
                _trackingEventsManager.init(trackingEvents, _mediaPlayer);
                _trackingEventsManager.start();
            }

            // Load the media files
            if (_mediaPlayer.load(baseUrl, mediaFiles)) {
                // Notify an ad is starting to play
                _eventBus.dispatchEvent({
                    type: "adMediaStart",
                    data: {}
                });

                _mediaPlayer.addEventListener('ended', _onMediaEnded);

                _mediaPlayer.play();
            }

            /*var mediaFilesSupported = [];

            // We filter the unsupported media files

            // First, we sort the mediafiles in bitrate ascending order
            mediaFiles.sort(function(a, b) {
                if (a.bitrate && b.bitrate) {
                    return a.bitrate - b.bitrate;
                }
                return -1;
            });*/

            // We play the media file with lowest bitrate
        },

        _sendImpression = function (impression) {
            var http = new XMLHttpRequest();

            _debug.log("Send Impression, uri = " + impression.uri);
            http.open("GET", impression.uri, true);
            http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            http.send();
        },

        _playCreative = function (index) {
            var creative = _vasts[_vastIndex].ad.inLine.creatives[index],
                linear;

            _creativeIndex = index;
            _debug.log("Play Creative, index = " + _creativeIndex);

            // Play Linear element
            linear = creative.linear;
            _debug.log("Play Linear Ad");
            _playMedia(_vasts[_vastIndex].baseUrl, linear.mediaFiles, linear.trackingEvents);
        },

        _playAd = function () {
            var ad = _vasts[_vastIndex].ad;

            _debug.log("Play Ad, id = " + ad.id);

            // Send Impression tracking
            if (ad.inLine.impression) {
                _sendImpression(ad.inLine.impression);
            }

            // Play first Creative
            _playCreative(0);
        },

        _playVast = function(index) {
            var vast = _vasts[index];

            _vastIndex = index;
            _debug.log("Play Vast, index = " + _vastIndex);

            _playAd();
        },

        _playNextVast = function () {

            _vastIndex++;

            if (_vastIndex < vasts.length) {
                _playVast(_vastIndex);
            } else {
                // Notify end of trigger
                _eventBus.dispatchEvent({
                    type: "adTriggerEnd",
                    data: {}
                });
            }
        },

        _playNextAd = function () {
            _playNextVast();
        },

        _playNextCreative = function () {
            var vast = _vasts[_vastIndex],
                ad = vasts[_vastIndex].ads[_adIndex];

            _creativeIndex++;

            if (_creativeIndex < ad.inLine.creatives.length) {
                _playCreative(ad.inLine.creatives[_creativeIndex]);
            } else {
                _playNextAd();
            }
        };


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    return {

        /**
         * Initializes the AdsPlayerManager.
         * @method init
         * @access public
         * @memberof AdsPlayerManager#
         * @param {Array} vasts - the array of Vast components to play
         */        
        init: function(vasts) {
            _vasts = vasts;
        },

        start: function() {
            if (_vasts.length === 0) {
                return;
            }

            // Notify a trigger is starting to play
            _eventBus.dispatchEvent({
                type: "adTriggerStart",
                data: {}
            });

            _playVast(0);
        },

        stop: function() {

        }

    };

};

AdsPlayer.AdsPlayerManager.prototype = {
    constructor: AdsPlayer.AdsPlayerManager
};