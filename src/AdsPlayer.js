/**
 * AdsPlayer.
 * @constructor AdsPlayer
 * @param {Object} adsPlayerContainer - the DOM container in which &lt;video&gt; and &lt;img&gt; HTML components will be appended
 */
AdsPlayer = function(adsPlayerContainer) {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    var NAME = 'AdsPlayer',
        VERSION = '0.2.1_dev',
        GIT_TAG = '@@REVISION',
        BUILD_DATE = '@@TIMESTAMP',
        _error = null,
        _warning = null,
        _adsPlayerContainer = adsPlayerContainer,
        _eventBus = AdsPlayer.EventBus.getInstance(),
        _adsPlayerController = null;


    var _onError = function(e) {
            _error = e.data;
        },

        _onWarning = function(e) {
            _warning = e.data;
        };


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    return {

        // Plugin API

        /**
         * [Plugin API, invoked by hasplayer.js]
         * Returns the plugin name.
         * @method getName
         * @access public
         * @memberof AdsPlayer#
         * @return {string} the plugin name
         */
        getName: function() {
            return NAME;
        },

        /**
         * [Plugin API, invoked by hasplayer.js]
         * Initializes the plugin.
         * @method init
         * @access public
         * @memberof AdsPlayer#
         * @param {Object} player - the MediaPlayer
         * @param {function} callback - the callback function to invoke when initialization is done
         */
        init: function(player, callback) {
            _adsPlayerController = new AdsPlayer.AdsPlayerController();
            _adsPlayerController.init(player, _adsPlayerContainer);
            _eventBus.addEventListener('error', _onError);
            _eventBus.addEventListener('warning', _onWarning);

            callback();
        },

        /**
         * [Plugin API, invoked by hasplayer.js]
         * This method is invoked when a new stream is to be loaded/opened.
         * @method load
         * @access public
         * @memberof AdsPlayer#
         * @param {object} stream - the stream contaning all stream informations (url, protData, mastUrl)
         */
        load: function(stream, callback) {
            if (stream.mastUrl) {
                _adsPlayerController.load(stream.mastUrl).then(function () {
                    callback();
                }, function () {
                    callback();
                });
            } else {
                callback();
            }
        },

        /**
         * [Plugin API, invoked by hasplayer.js]
         * This method is invoked when the current stream is to be stopped.
         * @method stop
         * @access public
         * @memberof AdsPlayer#
         */
        stop: function() {
            _adsPlayerController.stop();
        },

        /**
         * [Plugin API, invoked by hasplayer.js]
         * This method is invoked when the player is to be reset.
         * @method reset
         * @access public
         * @memberof AdsPlayer#
         */
        reset: function() {
            _adsPlayerController.reset();
        },


        // AdsPlayer additionnal API

        /**
         * Returns the plugin version.
         * @method getVersion
         * @access public
         * @memberof AdsPlayer#
         * @return {string} the plugin version
         */
        getVersion: function() {
            return VERSION;
        },

        /**
         * Returns the full plugin version, including git revision
         * @access public
         * @memberof AdsPlayer#
         * @return {string} the full plugin version, including git revision
         */
        getVersionFull: function () {
            if (GIT_TAG.indexOf("@@") === -1) {
                return VERSION + '_' + GIT_TAG;
            } else {
                return VERSION;
            }
        },

        /**
         * Returns the build date.
         * @method getBuildDate
         * @access public
         * @memberof AdsPlayer#
         * @return {string} the build date
         */
        getBuildDate: function() {
            if (BUILD_DATE.indexOf("@@") === -1) {
                return BUILD_DATE;
            } else {
                return 'Not a builded version';
            }
        },

        /**
         * Plays/resumes the playback of the current ad.
         * @method pause
         * @access public
         * @memberof AdsPlayer#
         */
        play: function() {
            _adsPlayerController.play();
        },

        /**
         * Pauses the playback of the current ad.
         * @method pause
         * @access public
         * @memberof AdsPlayer#
         */
        pause: function() {
            _adsPlayerController.pause();
        },

        /**
         * Registers a listener on the specified event.
         * The possible event types are:
         * <li>'error' (see [error]{@link AdsPlayer#event:error} event specification)
         * <li>'warning' (see [warning]{@link AdsPlayer#event:warning} event specification)
         * <li>'start' (see [start]{@link AdsPlayer#event:start} event specification)
         * <li>'end' (see [end]{@link AdsPlayer#event:end} event specification)
         * <li>'click' (see [click]{@link AdsPlayer#event:click} event specification)
         * @method addEventListener
         * @access public
         * @memberof AdsPlayer#
         * @param {string} type - the event type for listen to
         * @param {callback} listener - the callback which is called when an event of the specified type occurs
         * @param {boolean} useCapture - see HTML DOM addEventListener() method specification
         */
        addEventListener: function(type, listener, useCapture) {
            _eventBus.addEventListener(type, listener, useCapture);
        },

        /**
         * Unregisters the listener previously registered with the addEventListener() method.
         * @method removeEventListener
         * @access public
         * @memberof AdsPlayer#
         * @see [addEventListener]{@link AdsPlayer#addEventListener}
         * @param {string} type - the event type on which the listener was registered
         * @param {callback} listener - the callback which was registered to the event type
         */
        removeEventListener: function(type, listener) {
            _eventBus.removeEventListener(type, listener);
        },

        /**
         * Returns the Error object for the most recent error.
         * @access public
         * @memberof AdsPlayer#
         * @return {object} the Error object for the most recent error, or null if there has not been an error
         */
        getError: function() {
            return _error;
        },

        /**
         * Returns the Warning object for the most recent warning.
         * @access public
         * @memberof AdsPlayer#
         * @return {object} the Warning object for the most recent warning, or null if there has not been a warning
         */
        getWarning: function() {
            return _warning;
        }
    };
};

/**
 * @class
 * @classdesc AdsPlayer
 */
AdsPlayer.prototype = {
    constructor: AdsPlayer
};

AdsPlayer.mast = {};
AdsPlayer.mast.model = {};
AdsPlayer.mast.model.Trigger = {};
AdsPlayer.mast.model.Trigger.Condition = {};
AdsPlayer.vast = {};
AdsPlayer.vast.model = {};
AdsPlayer.vast.model.Vast = {};
AdsPlayer.media = {};
AdsPlayer.utils = {};



/////////// EVENTS

/**
 * The 'start' event is fired when the playback of ad(s) is starting.
 * When the 'start' event is fired, the application shall hide the main player component and
 * display the ads player container in which the ad media player component(s) will be created
 * and displayed.
 *
 * @event AdsPlayer#start
 * @param {object} event - the event
 * @param {object} event.type - the event type ('start')
 */

/**
 * The 'end' event is fired when the playback of ad(s) has ended.
 * When the 'end' event is fired, the application shall display the main player component and
 * hide the ads player container.
 *
 * @event AdsPlayer#end
 * @param {object} event - the event
 * @param {object} event.type - the event type ('end')
 */

/**
 * The 'addElement' event is fired when a DOM element for playing an ad has been created
 * and will be appended in the ads player container.
 * The element can be either a &lt;video&gt; or an &lt;img&gt; element.
 *
 * @event AdsPlayer#addElement
 * @param {object} event - the event
 * @param {object} event.type - the event type ('addElement')
 * @param {object} event.data - the event data
 * @param {string} event.data.element - the created element
 * @param {string} event.data.type - the type of the element, 'video' for &lt;video&gt; or 'image' for &lt;img&gt;
 */

/**
 * The 'removeElement' event is fired when the DOM element for playing an ad is being removed
 * from the ads player container and deleted.
 *
 * @event AdsPlayer#removeElement
 * @param {object} event - the event
 * @param {object} event.type - the event type ('removeElement')
 * @param {object} event.data - the event data
 * @param {string} event.data.element - the created element
 * @param {string} event.data.type - the type of the element, 'video' for &lt;video&gt; or 'image' for &lt;img&gt;
 */

/**
 * The 'play' event is fired when the playback of media ad is starting.
 *
 * @event AdsPlayer#play
 * @param {object} event - the event
 * @param {object} event.type - the event type ('play')
 */

/**
 * The 'pause' event is fired when the playback of an ad is paused.
 *
 * @event AdsPlayer#pause
 * @param {object} event - the event
 * @param {object} event.type - the event type ('pause')
 */

/**
 * The 'click' event is fired when a click has been performed on the ad component.
 * When the 'click' event is fired, the application shall open the web page with the provided URI.
 *
 * @event AdsPlayer#click
 * @param {object} event - the event
 * @param {object} event.type - the event type ('click')
 * @param {object} event.data - the event data
 * @param {string} event.data.uri - the web page uri
 */

/**
 * The error event is fired when an error occurs.
 * When the error event is fired, the application shall stop the player.
 *
 * @event AdsPlayer#error
 * @param {object} event - the event
 * @param {object} event.type - the event type ('error')
 * @param {object} event.data - the event data
 * @param {string} event.data.code - error code
 * @param {string} event.data.message - error message
 * @param {object} event.data.data - error additionnal data
 */

/**
 * The warning event is fired when a warning occurs.
 *
 * @event AdsPlayer#warning
 * @param {object} event - the event
 * @param {object} event.type - the event type ('warning')
 * @param {object} event.data - the event data
 * @param {string} event.data.code - warning code
 * @param {string} event.data.message - warning message
 * @param {object} event.data.data - warning additionnal data
 */