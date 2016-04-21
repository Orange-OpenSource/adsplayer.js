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


AdsPlayerController = function() {

    var _mainVideo,
        _adsMediaPlayer = new AdsMediaPlayer,
        _error = null,
        _warning = null,
        _self = this,
        _mastFileContent = "",
        _mastTriggers = [],
        _listVastAds = [], // this table is used to track the (groups of) ads to be played
        _fileLoader = new AdsPlayer.FileLoader(),
        _errorHandler = adErrorHandler.getInstance,
        _mastParser = new AdsPlayer.mast.MastParser(),
        _eventBus = adEventBus.getInstance();

    /////////// INITIALIZATION


    var _onMainVideoLoadStart = function() {
            _analyseTriggers();
        },

        _onPlaying = function() {
            console.log('pause main video');
            _mainVideo.pause();
        },

        _dispatchEvent = function(type) {
            _eventBus.dispatchEvent({
                type: type,
                data: {}
            });
        },

        _analyseTriggers = function() { //    Look for preRoll ads triggers 
            var i, j;
            var preRoll = 'false';

            for (i = 0; i < _mastTriggers.length; i++) {
                var trigger = _mastTriggers[i];
                if (trigger.alreadyPlayed || trigger.startConditions == []) {
                    continue;
                }
                if (trigger.startConditions[0].type === ConditionType.EVENT && trigger.startConditions[0].name === ConditionName.ON_ITEM_START) {
                    preRoll = true;
                    for (j = 0; j < trigger.sources.length; j++) {
                        _listVastAds.push(trigger.sources[j].uri)
                    }
                    trigger.alreadyPlayed = true;
                } else if (trigger.startConditions[0].type === ConditionType.PROPERTY &&
                    trigger.startConditions[0].name === ConditionName.POSITION &&
                    trigger.startConditions[0].operator === ConditionOperator.GEQ &&
                    trigger.startConditions[0].value === 0) {
                    preRoll = true;
                    for (j = 0; j < trigger.sources.length; j++) {
                        _listVastAds.push(trigger.sources[j].uri)
                    }
                    trigger.alreadyPlayed = true;
                }
            }
            if (preRoll) {
                console.log('PreRoll');
                _dispatchEvent("adStart");
                _mainVideo.addEventListener("playing", _onPlaying);
                _playAds();
            }
        },

        _createCues = function() {

            // sort elements by date
            _mastTriggers.sort(function(a, b) {
                if (a.startTime < b.startTime)
                    return -1;
                else if (a.startTime > b.startTime)
                    return 1;
                else
                    return 0;
            })

            // create cues according to the sorted ads
            var cues = [];
            var Cue = window.VTTCue || window.TextTrackCue;

            for (var i = 0; i < self.mastTriggers.length; i++) {
                var trigger = self.mastTriggers[i];
                if (trigger.startConditions[0].type === ConditionType.PROPERTY &&
                    trigger.startConditions[0].name === ConditionName.POSITION &&
                    trigger.startConditions[0].operator === ConditionOperator.GEQ) {
                    var newCue = new Cue(trigger.startConditions[0].value, trigger.startConditions[0].value + 1, i);
                    cues.push(cue);
                }
                return cues;
            };
        },

        _parseMastFile = function() {
            if (_mastFileContent !== '') {
                _mastTriggers = _mastParser.parse(_mastFileContent);
            }

            if (_mastTriggers !== []) {
                // here goes the code parsing the triggers'sources if in vast format

                createPreRollTriggers(_mastTriggers); // for test only

                //_createCues();
            }
            _dispatchEvent("mastLoaded");
        },


        _onError = function(e) {
            error = e.data;
        },

        _onWarning = function(e) {
            warning = e.data;
        },

        _onEnded = function(msg) {
            if (!msg) {
                msg = 'ad video ended';
            }
            console.log(msg);
            if (_listVastAds.length) {
                _playAds();
            } else {
                _mainVideo.removeEventListener("playing", _onPlaying);
                console.log('no more Ads to Play : dispatch "adEnd" towards the html Player');
                _dispatchEvent("adEnd");
                console.log('play main video')
                _mainVideo.play();
            }
        },

        _onAborted = function() {
            _onEnded('ad video aborted due to error on the adsMediaPlayer, e.g. : file not found');
        },


        _playAds = function() {
            var i;
            if (_listVastAds.length) {
                var videoUrl = _listVastAds.shift();
                _adsMediaPlayer.playVideo(videoUrl);
            }
        };


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    /**
     * Initialize the Ads Player Controller.
     * @method init
     * @access public
     * @memberof AdsPlayerController#
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {Object} adsContainer - The container to create the HTML5 video element used to play and render the Ads video streams
     */

    var _init = function(mainVideo, adsContainer) {
            if (!mainVideo || !adsContainer) {
                throw new Error('AdsPlayerController.init(): Invalid Argument');
            }
            _mainVideo = mainVideo;
            _mainVideo.addEventListener("loadstart", _onMainVideoLoadStart.bind(this));

            _adsMediaPlayer.init()
            _adsMediaPlayer.createVideoElt(adsContainer);
            _adsMediaPlayer.addlistener("ended", _onEnded);
            _adsMediaPlayer.addlistener("aborted", _onAborted);
        },



        /////////// ERROR/WARNING

        /**
         * Returns the Error object for the most recent error
         * @access public
         * @memberof AdsPlayerController#
         * @return {object} the Error object for the most recent error, or null if there has not been an error
         */
        _getError = function() {
            return _error;
        },

        /**
         * Returns the Warning object for the most recent warning
         * @access public
         * @memberof AdsPlayerController#
         * @return {object} the Warning object for the most recent warning, or null if there has not been a warning
         */
        _getWarning = function() {
            return _warning;
        },


        /**
         * Load/open a MAST file.
         * @method load
         * @access public
         * @memberof AdsPlayerController#
         * @param {string} mastUrl - the MAST file url
         */
        _load = function(url) {
            _addEventListener("mastFileLoaded", _parseMastFile);

            _fileLoader.load(url).then(function(result) {
                console.log("output from mast file loading : ");
                console.log("***************************************************");
                console.log(result.response);
                console.log("***************************************************");
                console.log('');
                _mastFileContent = result.response;
                _dispatchEvent("mastFileLoaded");
            }, function(reason) {
                console.log(reason);
                alert(reason.message);
            });
        },

        /**
         * Stops and resets the Ads player.
         * @method reset
         * @access public
         * @memberof AdsPlayerController#
         */
        _reset = function() {
            // TODO
        },

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
        _addEventListener = function(type, listener, useCapture) {
            _eventBus.addEventListener(type, listener);
        },

        /**
         * dispatch the specified event
         * The possible event types are:
         * @method dispatchEvent
         * @access public
         * @memberof AdsPlayerController#
         * @param {string} type - the event type for listen to
         */
        _dispatchEvent = function(type) {
            _eventBus.dispatchEvent({
                type: type,
                data: {}
            });
        },


        /**
         * Unregisters the listener previously registered with the addEventListener() method.
         * @method removeEventListener
         * @access public
         * @memberof AdsPlayerController#
         * @see [addEventListener]{@link AdsPlayerController#addEventListener}
         * @param {string} type - the event type on which the listener was registered
         * @param {callback} listener - the callback which was registered to the event type
         */
        _removeEventListener = function(type, listener) {
            _eventBus.removeEventListener(type, listener);
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


    _fileLoader.debug = {};
    _fileLoader.debug.log = function(debugText) {
        console.log(debugText);
    };

    return {
        init: _init,
        addEventListener: _addEventListener,
        load: _load.bind(this),
        getError: _getError,
        getWarning: _getWarning
    }

};








// create a preRoll Trigger for test    

var createPreRollTrigger = function(uri, uri2) {
    var trigger = new AdsPlayer.mast.model.Trigger();
    trigger.id = 'preRoll';
    trigger.description = 0;
    var condition = new AdsPlayer.mast.model.Trigger.Condition();
    condition.type = 'event';
    condition.name = 'OnItemStart';
    condition.value = '';
    condition.operator = '';
    condition.conditions = [];

    trigger.startConditions.push(condition);

    trigger.endConditions = [];

    var source = new AdsPlayer.mast.model.Trigger.Source();
    source.uri = uri;
    source.altReference = '';
    source.format = '';
    source.sources = [];

    trigger.sources.push(source);

    if (uri2) {
        var source2 = new AdsPlayer.mast.model.Trigger.Source();
        source2.uri = uri;
        source2.altReference = '';
        source2.format = '';
        source2.sources = [];
        source2.uri = uri2;
        trigger.sources.push(source2);
    }
    trigger.alreadyPlayed = false; // mainly in the seeked case : do not replay trigger allready played

    return trigger;
}

var createMidRollTrigger = function(time, uri, uri2) {
    var trigger = new AdsPlayer.mast.model.Trigger();
    trigger.id = 'preRoll';
    trigger.description = 0;
    var condition = new AdsPlayer.mast.model.Trigger.Condition();
    condition.type = 'property';
    condition.name = 'Position';
    condition.value = time;
    condition.operator = 'GEQ';
    condition.conditions = [];

    trigger.startConditions.push(condition);

    trigger.endConditions = [];

    source = new AdsPlayer.mast.model.Trigger.Source();
    source.uri = uri;
    source.altReference = '';
    source.format = '';
    source.sources = [];

    trigger.sources.push(source); // pointer to a list of sources : AdsPlayer.mast.model.Trigger.Source

    if (uri2) {
        var source2 = new AdsPlayer.mast.model.Trigger.Source();
        source2.uri = uri;
        source2.altReference = '';
        source2.format = '';
        source2.sources = [];
        source2.uri = uri2;
        trigger.sources.push(source2);
    }

    trigger.alreadyPlayed = false; // mainly in the seeked case : do not replay trigger allready played

    return trigger;
}

var createPreRollTriggers = function(triggers) {
    var trigger;
    trigger = createPreRollTrigger('http://localhost:8080/adsPlayer.js/demo/medias/pubOasis.mp4');
    triggers.push(trigger);
    trigger = createPreRollTrigger('http://localhost:8080/adsPlayer.js/demo/medias/pubLancome.mp4',
        'http://localhost:8080/adsPlayer.js/demo/medias/pubClipper.mp4');
    triggers.push(trigger);
    trigger = createMidRollTrigger(0, 'http://localhost:8080/adsPlayer.js/demo/medias/pubLego.mp4');
    triggers.push(trigger);
    trigger = createMidRollTrigger(10, 'http://localhost:8080/adsPlayer.js/demo/medias/pubLego.mp4');
    triggers.push(trigger);
    trigger = createMidRollTrigger(20, 'http://localhost:8080/adsPlayer.js/demo/medias/pubLancome.mp4');
    triggers.push(trigger);
}