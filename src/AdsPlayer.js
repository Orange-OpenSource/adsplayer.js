/**
 * The copyright in this software module is being made available under the BSD License, included below. This software module may be subject to other third party and/or contributor rights, including patent rights, and no such rights are granted under this license.
 * The whole software resulting from the execution of this software module together with its external dependent software modules from dash.js project may be subject to Orange and/or other third party rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2016, Orange
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Orange nor the names of its contributors may be used to endorse or promote products derived from this software module without specific prior written permission.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * @constructs AdsPlayer
 *
 */

AdsPlayer = function(adsContainer) {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    var NAME = "AdsPlayer",
        VERSION = "0.0.1_dev",
        GIT_TAG = "@@REVISION",
        BUILD_DATE = "@@TIMESTAMP",
        _error = null,
        _warning = null,
        _adsContainer = adsContainer,
        adsPlayerController = null;

    var _onError = function(e) {
            error = e.data;
        },

        _onWarning = function(e) {
            warning = e.data;
        };

    /////////// INITIALIZATION

    /**
     * Initialize the AdsPlayer.
     * @method init
     * @access public
     * @memberof AdsPlayer#
     * @param {Object} player - the MediaPlayer
     * @param {function} callback - the callback function to invoke when initialization is done
     */
    var _init = function(player, callback) {
        adsPlayerController = new AdsPlayerController();
        adsPlayerController.init(player, _adsContainer);
        callback();
    },

    /**
     * Returns the version of the Ads player.
     * @method getVersion
     * @access public
     * @memberof AdsPlayer#
     * @return {string} the version of the Ads player
     */
    _getVersion = function() {
        return VERSION;
    },

    /**
     * Returns the build date of this Ads player.
     * @method getBuildDate
     * @access public
     * @memberof AdsPlayer#
     * @return {string} the build date of this Ads player
     */
    _getBuildDate = function() {
        if (BUILD_DATE.indexOf("@@") === -1) {
            return BUILD_DATE;
        } else {
            return 'Not a builded version';
        }
    },

    /////////// ERROR/WARNING

    /**
     * Returns the Error object for the most recent error
     * @access public
     * @memberof AdsPlayer#
     * @return {object} the Error object for the most recent error, or null if there has not been an error
     */
    _getError = function() {
        return error;
    },

    /**
     * Returns the Warning object for the most recent warning
     * @access public
     * @memberof AdsPlayer#
     * @return {object} the Warning object for the most recent warning, or null if there has not been a warning
     */
    _getWarning = function() {
        return warning;
    },

    ///////////

    /**
     * Load/open a stream.
     * @method load
     * @access public
     * @memberof AdsPlayer#
     * @param {object} stream - the stream contaning all stream informations (url, protData, mastUrl)
     */
    _load = function(stream, callback) {
        if (stream.mastUrl) {
            adsPlayerController.addEventListener('mastLoaded', function () {
                callback();
            });
            adsPlayerController.addEventListener('mastNotLoaded', function () {
 //               throw new Error("AdsPlayer.load(): couldn't load mast file");
                callback();
            });
            adsPlayerController.load(stream.mastUrl);
        } else{
            callback();
        }
    },

    /**
     * Stops Ads player.
     * @method reset
     * @access public
     * @memberof AdsPlayer#
     */
    _stop = function() {
        adsPlayerController.stop();
    },

    /**
     * Stops and resets the Ads player.
     * @method reset
     * @access public
     * @memberof AdsPlayer#
     */
    _reset = function() {
        adsPlayerController.reset();
    },

    /////////// EVENTS

    /**
     * Registers a listener on the specified event.
     * The possible event types are:
     * <li>'error' (see [error]{@link AdsPlayer#event:error} event specification)
     * <li>'warning' (see [warning]{@link AdsPlayer#event:warning} event specification)
     * <li>'adStart' (see [adStart]{@link AdsPlayer#event:adStart} event specification)
     * <li>'adEnd' (see [adEnd]{@link AdsPlayer#event:adEnd} event specification)
     * @method addEventListener
     * @access public
     * @memberof AdsPlayer#
     * @param {string} type - the event type for listen to
     * @param {callback} listener - the callback which is called when an event of the specified type occurs
     * @param {boolean} useCapture - see HTML DOM addEventListener() method specification
     */
    _addEventListener = function(type, listener, useCapture) {
        adsPlayerController.addEventListener(type, listener, useCapture);
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
    _removeEventListener = function(type, listener) {
        adsPlayerController.removeEventListener(type, listener);
    };

    return {
        ///////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

        // Plugin API
        getName: function () {return NAME;},
        getVersion: _getVersion,
        init: _init,
        load: _load,
        stop: _stop,
        reset: _reset,

        addEventListener: _addEventListener,
        removeEventListener: _removeEventListener,
        getBuildDate: _getBuildDate,
        getError: _getError,
        getWarning: _getWarning
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
AdsPlayer.vast.model.Ad = {};
AdsPlayer.utils = {};