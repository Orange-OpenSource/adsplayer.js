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
 * @constructs OrangeHasPlayer
 *
 */
/*jshint -W020 */
AdsPlayer = function() {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////
    var VERSION = "1.0.0_dev",
        GIT_TAG = "@@REVISION",
        BUILD_DATE = "@@TIMESTAMP",
        _mainVideo,
        _adsVideo,
        _error = null,
        _warning = null;


    var _onMainVideoLoadStart = function () {
        // TODO
    };

    var _onMainVideoPlaying = function () {
        // TODO
    };

    // ...

    var _onError = function(e) {
        error = e.data;
    };

    var _onWarning = function(e) {
        warning = e.data;
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    /////////// INITIALIZATION

    /**
     * Initialize the Ads player.
     * @method init
     * @access public
     * @memberof AdsPlayer#
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {Object} adsVideo - the HTML5 video element used to play and render the Ads video streams
     */
    this.init = function(mainVideo, adsVideo) {
        if (!mainVideo || !adsVideo) {
            throw new Error('AdsPlayer.init(): Invalid Argument');
        }

        _mainVideo = mainVideo;
        _adsVideo = adsVideo;

        context = new MediaPlayer.di.Context();
        mediaPlayer = new MediaPlayer(context);
        video = videoElement;
        mediaPlayer.startup();
        mediaPlayer.attachView(video);
        state = 'PLAYER_CREATED';

        debug = mediaPlayer.getDebug();

        _mainVideo.addEventListener("loadstart", _onMainVideoLoadStart.bind(this));
        _mainVideo.addEventListener("playing", _onMainVideoPlaying.bind(this));
    };

    /**
     * Returns the version of the Ads player.
     * @method getVersion
     * @access public
     * @memberof AdsPlayer#
     * @return {string} the version of the Ads player
     */
    this.getVersion = function() {
        return VERSION;
    };


    /**
     * Returns the build date of this Ads player.
     * @method getBuildDate
     * @access public
     * @memberof AdsPlayer#
     * @return {string} the build date of this Ads player
     */
    this.getBuildDate = function() {
        if (BUILD_DATE.indexOf("@@") === -1) {
            return BUILD_DATE;
        } else {
            return 'Not a builded version';
        }
    };

    /////////// ERROR/WARNING

    /**
     * Returns the Error object for the most recent error
     * @access public
     * @memberof AdsPlayer#
     * @return {object} the Error object for the most recent error, or null if there has not been an error
     */
    this.getError = function() {
        return error;
    };

    /**
     * Returns the Warning object for the most recent warning
     * @access public
     * @memberof AdsPlayer#
     * @return {object} the Warning object for the most recent warning, or null if there has not been a warning
     */
    this.getWarning = function() {
        return warning;
    };

    ///////////

    /**
     * Load/open a MAST file.
     * @method load
     * @access public
     * @memberof AdsPlayer#
     * @param {string} mastUrl - the MAST file url
     */
    this.load = function(mastUrl) {
        // TODO
    };

    /**
     * Stops and resets the Ads player.
     * @method reset
     * @access public
     * @memberof AdsPlayer#
     */
    this.reset = function() {
        // TODO
    };

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
    this.addEventListener = function(type, listener, useCapture) {
        // TODO
    };

    /**
     * Unregisters the listener previously registered with the addEventListener() method.
     * @method removeEventListener
     * @access public
     * @memberof AdsPlayer#
     * @see [addEventListener]{@link AdsPlayer#addEventListener}
     * @param {string} type - the event type on which the listener was registered
     * @param {callback} listener - the callback which was registered to the event type
     */
    this.removeEventListener = function(type, listener) {
        // TODO
    };

    /////////// EVENTS

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

     /**
     * The adStart event is fired when the Ads player starts to play and ad.
     *
     * @event AdsPlayer#cueEnter
     * @param {object} event - the event
     * @param {object} event.type - the event type ('adStart')
     */

     /**
     * The adEnd event is fired when the Ads player has ended to play and ad.
     *
     * @event AdsPlayer#cueEnter
     * @param {object} event - the event
     * @param {object} event.type - the event type ('adEnd')
     */
};


