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
AdsPlayerController = function() {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////
    var VERSION = "1.0.0_dev",
        GIT_TAG = "@@REVISION",
        BUILD_DATE = "@@TIMESTAMP",
        _mainVideo,
        _error = null,
        _warning = null;


    var _onMainVideoLoadStart = function () {
        // TODO
    };

    var _onMainVideoPlaying = function () {
        if(this.preRoll){
             _mainVideo.pause();
             console.log('pause main video');
       }
    };

    // ...

    var _onError = function(e) {
        error = e.data;
    };

    var _onWarning = function(e) {
        warning = e.data;
    };

    var self = this;

    var adsMediaPlayer=new AdsMediaPlayer;

    function _onEnded() {
        console.log('ad video ended');
        self.dispatchEvent("adEnd");
        self.preRoll=false;
        _mainVideo.removeEventListener("playing",_onMainVideoPlaying);
        _mainVideo.play();
        console.log('play main video')
    };


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    /////////// INITIALIZATION

    /**
     * Initialize the Ads player.
     * @method init
     * @access public
     * @memberof AdsPlayerController#
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {Object} adsContainer - The container to create the HTML5 video element used to play and render the Ads video streams
     */


    var mastFileContent="";
    var mastTriggers = [];

    this.listVastAds = [];   // this table is used to track the (groups of) ads to be played
                             // as defined in the vast files : one entry per vast file
                             // each group except for the preroll/enroll cases will be associated to a cue 

    this.fileLoader = new AdsPlayer.FileLoader();
    this.fileLoader.errorHandler = new AdsPlayer.ErrorHandler();
    this.mastParser = new AdsPlayer.Mast.MastParser();
    this.eventBus = new AdsPlayer.EventBus();

    this.preRoll = false;               // to indicate if a preRoll ad has been detected

    this.fileLoader.debug = {};
    this.fileLoader.debug.log = function(debugText){  
       console.log(debugText);
    };

    this.init = function(mainVideo,adsContainer) {
        if (!mainVideo || !adsContainer) {
            throw new Error('AdsPlayerController.init(): Invalid Argument');
        }
        _mainVideo = mainVideo;
        _adsContainer   = adsContainer;
        adsMediaPlayer.createVideoElt(adsContainer);
        adsMediaPlayer.addlistener("ended", _onEnded);
    }

    this.playAd = function(videoUrl) {
        if(this.preRoll){
            console.log('PreRoll');
        } else {
            console.log('MidRoll');
        }

        if (!videoUrl) {
            throw new Error('AdsPlayerController.playVideo(): Invalid Argument');
        }
        this.dispatchEvent("adStart");
        if(!this.preRoll){
            _mainVideo.pause();
        } 
        adsMediaPlayer.playVideo(videoUrl);
    };

    this.analyseCues = function() {
        this.preRoll=true;
        if (this.preRoll){
            _mainVideo.addEventListener("playing", _onMainVideoPlaying.bind(this));
            this.playAd('http://localhost:8080/adsPlayer.js/demo/medias/pubOasis.mp4');
        }
    }

    /**
     * Returns the version of the Ads player.
     * @method getVersion
     * @access public
     * @memberof AdsPlayerController#
     * @return {string} the version of the Ads player
     */
    this.getVersion = function() {
        return VERSION;
    };


    /**
     * Returns the build date of this Ads player.
     * @method getBuildDate
     * @access public
     * @memberof AdsPlayerController#
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
     * @memberof AdsPlayerController#
     * @return {object} the Error object for the most recent error, or null if there has not been an error
     */
    this.getError = function() {
        return error;
    };

    /**
     * Returns the Warning object for the most recent warning
     * @access public
     * @memberof AdsPlayerController#
     * @return {object} the Warning object for the most recent warning, or null if there has not been a warning
     */
    this.getWarning = function() {
        return warning;
    };

    ///////////


    this.parseMastFile = function() {
      if(self.mastFileContent !== ''){
          self.mastTriggers=self.mastParser.parse(mastFileContent);
      }

      if(self.mastTriggers !== []) {
          // here goes the code parsing the triggers'sources if in vast format
      }
     self.dispatchEvent("mastLoaded");
    }


    /**
     * Load/open a MAST file.
     * @method load
     * @access public
     * @memberof AdsPlayerController#
     * @param {string} mastUrl - the MAST file url
     */
    this.load = function(url) {
        this.addEventListener("mastFileLoaded",this.parseMastFile);

        this.fileLoader.load(url).then(function(result){
            console.log("output from mast file loading : ");
            console.log("***************************************************");
            console.log(result.response);
            console.log("***************************************************");
            console.log('');
            mastFileContent=result.response;
            self.dispatchEvent("mastFileLoaded");
        },function(reason){
            console.log(reason);
            alert(reason.message);
        });
    }

    /**
     * Stops and resets the Ads player.
     * @method reset
     * @access public
     * @memberof AdsPlayerController#
     */
    this.reset = function() {
        // TODO
    };

    /////////// EVENTS

    /**
     * Registers a listener on the specified event.
     * The possible event types are:
     * <li>'error' (see [error]{@link AdsPlayerController#event:error} event specification)
     * <li>'warning' (see [warning]{@link AdsPlayerController#event:warning} event specification)
     * <li>'adStart' (see [adStart]{@link AdsPlayerController#event:adStart} event specification)
     * <li>'adEnd' (see [adEnd]{@link AdsPlayerController#event:adEnd} event specification)
     * @method addEventListener
     * @access public
     * @memberof AdsPlayerController#
     * @param {string} type - the event type for listen to
     * @param {callback} listener - the callback which is called when an event of the specified type occurs
     * @param {boolean} useCapture - see HTML DOM addEventListener() method specification
     */
    this.addEventListener = function(type, listener, useCapture) {
        this.eventBus.addEventListener(type,listener);
    };

    /**
     * dispatch the specified event 
     * The possible event types are:
     * @method dispatchEvent
     * @access public
     * @memberof AdsPlayerController#
     * @param {string} type - the event type for listen to
     */
    this.dispatchEvent = function(type) {
        self.eventBus.dispatchEvent({
              type : type,
              data : {}
            });
    };


    /**
     * Unregisters the listener previously registered with the addEventListener() method.
     * @method removeEventListener
     * @access public
     * @memberof AdsPlayerController#
     * @see [addEventListener]{@link AdsPlayerController#addEventListener}
     * @param {string} type - the event type on which the listener was registered
     * @param {callback} listener - the callback which was registered to the event type
     */
    this.removeEventListener = function(type, listener) {
        this.eventBus.removeEventListener(type,listener);
    };

    /////////// EVENTS

    /**
     * The error event is fired when an error occurs.
     * When the error event is fired, the application shall stop the player.
     *
     * @event AdsPlayerController#error
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
     * @event AdsPlayerController#warning
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
     * @event AdsPlayerController#cueEnter
     * @param {object} event - the event
     * @param {object} event.type - the event type ('adStart')
     */

     /**
     * The adEnd event is fired when the Ads player has ended to play and ad.
     *
     * @event AdsPlayerController#cueEnter
     * @param {object} event - the event
     * @param {object} event.type - the event type ('adEnd')
     */
};


