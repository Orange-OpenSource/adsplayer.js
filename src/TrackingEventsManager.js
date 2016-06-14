
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


        _listenPlayerEvents = function () {

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