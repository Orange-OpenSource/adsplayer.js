
/**
 * The CreativePlayer manages:
 * - the playing of media files within a Creative (with the help of a Image/VideoPlayer)
 * - the tracking events (with the help of a TrackingEventsManager)
 * - the display of the ad skipping component
 * - the user clicks
 */
AdsPlayer.vast.CreativePlayer = function() {

    var _adPlayerContainer = null,
        _mediaPlayer = null,
        _trackingEventsManager = null,
        _skipElement = null,
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance(),

        _parseTime = function(str) {
            var timeParts,
                SECONDS_IN_HOUR = 60 * 60,
                SECONDS_IN_MIN = 60;

            if (!str) {
                return -1;
            }

            timeParts = str.split(':');

            // Check time format, must be HH:MM:SS(.mmm)
            if (timeParts.length !== 3) {
                return -1;
            }

            return  (parseInt(timeParts[0]) * SECONDS_IN_HOUR) + 
                    (parseInt(timeParts[1]) * SECONDS_IN_MIN) + 
                    (parseFloat(timeParts[2]));
        },

        _onMediaError = function () {

            _debug.log("Media error");

            // Notify the creative has ended
            _eventBus.dispatchEvent({
                type: "adCreativeEnd",
                data: {}
            });
        },

        _onMediaEnded = function () {

            _debug.log("Media ended");

            // Notify the creative has ended
            _eventBus.dispatchEvent({
                type: "adCreativeEnd",
                data: {}
            });
        },

        _onMediaTimeupdate = function () {

            var currenttime = _mediaPlayer.getCurrentTime();
            //_debug.log("Media timeupdate");
        },

        _onAdClick = function () {
            // this = creative
            if (!this.videoClicks) {
                return;
            }

            // ClickThrough
            if (this.videoClicks.clickThrough) {
                _eventBus.dispatchEvent({
                    type: "adClickThrough",
                    data: {
                        uri: this.videoClicks.clickThrough
                    }
                });                
            }

            // ClickTracking
            if (this.videoClicks.clickTracking) {

            }
        },

        _creatSkipElement = function() {
            _skipElement = document.createElement('button');
            _skipElement.id = 'adSkip';
            _skipElement.innerHTML = '';
            _skipElement.className = 'adskip-button';
            _skipElement.style.visibility = 'visible';
            _adPlayerContainer.appendChild(_skipElement);
        },

        _play = function (creative, baseUrl) {
            var mediaFile,
                isVideo,
                isImage;

            if (!creative) {
                return false;
            }

            mediaFiles = creative.mediaFiles;
            if (creative.mediaFiles.length === 0) {
                return false;
            }

            mediaFile = creative.mediaFiles[0];

            // Video or image media ?
            isVideo = mediaFile.type.indexOf('video') !== -1; 
            isImage = mediaFile.type.indexOf('image') !== -1;

            if (isVideo) {
                _mediaPlayer = new AdsPlayer.media.VideoPlayer();
            }
            else if (isImage) {
                _mediaPlayer = new AdsPlayer.media.ImagePlayer();
            } else {
                // Unknown/unsupported media type
                return false;
            }

            // Load the media files
            if (!_mediaPlayer.load(baseUrl, creative.mediaFiles)) {
                _mediaPlayer = null;
                return false;
            }

            _mediaPlayer.setDuration(_parseTime(creative.duration));
            _mediaPlayer.addEventListener('error', _onMediaError);
            _mediaPlayer.addEventListener('timeupdate', _onMediaTimeupdate);
            _mediaPlayer.addEventListener('ended', _onMediaEnded);

            // Add tracking events
            if (creative.trackingEvents) {
                _trackingEventsManager = new AdsPlayer.vast.TrackingEventsManager();
                _trackingEventsManager.init(creative.trackingEvents, _mediaPlayer);
                _trackingEventsManager.start();
            }

            // Notify a creative is starting to play
            _eventBus.dispatchEvent({
                type: "adCreativeStart",
                data: {}
            });

            // Add the media player DOM element
            _adPlayerContainer.appendChild(_mediaPlayer.getElement());

            // Listener for click
            _mediaPlayer.getElement().addEventListener("click", _onAdClick.bind(creative));

            // Start playing the media
            _mediaPlayer.play();

            return true;
        },

        _stop = function () {

            if (!_mediaPlayer) {
                return;
            }

            // Remove the element from the DOM
            _adPlayerContainer.removeChild(_mediaPlayer.getElement());

            // Stop the media player
            _mediaPlayer.removeEventListener('error', _onMediaError);
            _mediaPlayer.removeEventListener('ended', _onMediaEnded);
            _mediaPlayer.stop();
            _mediaPlayer.reset();
            _mediaPlayer = null;

            // Stop the TrackingEvents manager
            if (_trackingEventsManager) {
                _trackingEventsManager.stop();
                _trackingEventsManager = null;
            }
        };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    return {

        /**
         * Initializes the creative player.
         * @method init
         * @access public
         * @memberof CreativePlayer#
         * @param {Object} creative - the creative element to play
         * @param {String} baseUrl - the base URL for media files
         */
        init: function(adPlayerContainer) {
            _adPlayerContainer = adPlayerContainer;
            //_creatSkipElement();
        },

        play: function(creative, baseUrl) {
            return _play(creative, baseUrl);
        },

        stop: function() {
            _stop();
        }

    };

};

AdsPlayer.vast.CreativePlayer.prototype = {
    constructor: AdsPlayer.vats.CreativePlayer
};