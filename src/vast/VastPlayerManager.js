
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
        _creativePlayer = null,
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance(),
        _mediaPlayer = null,
        _trackingEventsManager = null,

        _sendImpression = function (impression) {
            var http = new XMLHttpRequest();

            _debug.log("Send Impression, uri = " + impression.uri);
            http.open("GET", impression.uri, true);
            http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            http.send();
        },

        _onCreativeEnd = function () {

            _debug.log("Creative ended");

            // Stop the current creative media
            _stopCreative();

            // Play next creative
            _playNextCreative();
        },

        _stopCreative = function () {
            if (!_creativePlayer) {
                return;
            }
            _eventBus.removeEventListener('adCreativeEnd', _onCreativeEnd);
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
                _eventBus.addEventListener('adCreativeEnd', _onCreativeEnd);
                if (!_creativePlayer.play(creative.linear, _vasts[_vastIndex].baseUrl)) {
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

            // Send Impression tracking
            if (ad.inLine.impression) {
                _sendImpression(ad.inLine.impression);
            }

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
                    type: "adTriggerEnd",
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
         */        
        init: function(vasts, adPlayerContainer) {
            _vasts = vasts;
            _adPlayerContainer = adPlayerContainer;
            _creativePlayer = new AdsPlayer.vast.CreativePlayer();
            _creativePlayer.init(_adPlayerContainer);
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
            _stopCreative();
        }

    };

};

AdsPlayer.vast.VastPlayerManager.prototype = {
    constructor: AdsPlayer.vast.VastPlayerManager
};