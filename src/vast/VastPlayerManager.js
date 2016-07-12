/**
 * The VastPlayerManager manages the sequencing of playing creatives of a single VAST.
 * It takes as input the list of Vast objects as returned by the VAST parser.
 * For each Vast, the VastPlayerManager plays sequentially all contained Creatives,
 * with the help of a CreativePlayer.
 */
AdsPlayer.vast.VastPlayerManager = function() {

    var _vasts = [],
        _adPlayerContainer = null,
        _vastIndex = -1,
        _creativeIndex = -1,
        _creativePlayer = new AdsPlayer.vast.CreativePlayer(),
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance(),
        _mediaPlayer = null,

        _sendImpressions = function (impressions) {
            var impression,
                i;

            if (impressions.length === 0) {
                return;
            }

            for (i = 0; i < impressions.length; i++) {
                impression = impressions[i];
                if (impression.uri && impression.uri.length > 0) {
                    _debug.log("Send Impression, uri = " + impression.uri);
                    var http = new XMLHttpRequest();
                    http.open("GET", impression.uri, true);
                    http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    http.send();
                }            
            }
        },

        _onCreativeEnd = function () {

            _debug.log("Creative ended");

            // Stop the current creative media
            _stopCreative();

            // Play next creative
            _playNextCreative();
        },

        _pauseCreative = function () {
            if (!_creativePlayer) {
                return;
            }
            _creativePlayer.pause();
        },

        _resumeCreative = function () {
            if (!_creativePlayer) {
                return;
            }
            _creativePlayer.play();
        },

        _stopCreative = function () {
            if (!_creativePlayer) {
                return;
            }
            _eventBus.removeEventListener('creativeEnd', _onCreativeEnd);
            _creativePlayer.stop();
        },

        _playCreative = function (index) {
            var creative = _vasts[_vastIndex].ad.inLine.creatives[index],
                linear;

            _creativeIndex = index;
            _debug.log("Play Creative - index = " + _creativeIndex);

            // Play Linear element
            linear = creative.linear;

            if (linear) {
                _debug.log("Play Linear Ad, duration = " + linear.duration);
                _eventBus.addEventListener('creativeEnd', _onCreativeEnd);
                if (!_creativePlayer.load(creative.linear, _vasts[_vastIndex].baseUrl)) {
                    _playNextCreative();
                }
            } else {
                _playNextCreative();
            }
        },

        _playVast = function(index) {
            var vast = _vasts[index];
                ad = vast.ad;

            _vastIndex = index;
            _debug.log("Play Vast - index = " + _vastIndex + ", Ad id = " + ad.id);

            // Send Impressions tracking
            _sendImpressions(ad.inLine.impressions);

            // Play first Creative
            _playCreative(0);            
        },

        _playNextVast = function () {

            _vastIndex++;

            if (_vastIndex < _vasts.length) {
                _playVast(_vastIndex);
            } else {
                // Notify end of trigger
                _eventBus.dispatchEvent({
                    type: 'triggerEnd',
                    data: {}
                });
            }
        },

        _playNextCreative = function () {
            var ad = _vasts[_vastIndex].ad;

            _creativeIndex++;

            if (_creativeIndex < ad.inLine.creatives.length) {
                _playCreative(_creativeIndex);
            } else {
                _playNextVast();
            }
        };


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    return {

        /**
         * Initializes the VastPlayerManager.
         * @method init
         * @access public
         * @memberof VastPlayerManager#
         * @param {Array} vasts - the array of Vast components to play
         * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
         */        
        init: function(vasts, adPlayerContainer, mainVideo) {
            _vasts = vasts;
            _adPlayerContainer = adPlayerContainer;
            _creativePlayer.init(_adPlayerContainer, mainVideo);
        },

        start: function() {
            if (!_vasts || _vasts.length === 0) {
                return;
            }

            // Notify a trigger is starting to play
            _eventBus.dispatchEvent({
                type: 'triggerStart',
                data: {}
            });

            _playVast(0);
        },

        play: function() {
            _resumeCreative();
        },

        pause: function() {
            _pauseCreative();
        },

        stop: function() {
            _stopCreative();
        },

        reset: function() {
            _creativePlayer.reset();
        }      
    };

};

AdsPlayer.vast.VastPlayerManager.prototype = {
    constructor: AdsPlayer.vast.VastPlayerManager
};