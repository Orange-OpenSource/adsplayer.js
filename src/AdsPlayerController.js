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
 *
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


/**
 * [AdsPlayerController description]
 */
AdsPlayer.AdsPlayerController = function() {

    var _mainPlayer = null,
        _mainVideo = null,
        _adsContainer = null,
        _adsMediaPlayer = null,
        _error = null,
        _warning = null,
        _mastFileContent = "",
        _listCues = [],
        _mastTriggers = [],
        _mastBaseUrl = '',
        _listVastAds = [], // this table is used to track the (groups of) ads to be played
        _fileLoader = new AdsPlayer.FileLoader(),
        _errorHandler = adErrorHandler.getInstance,
        _mastParser = new AdsPlayer.mast.MastParser(),
        _eventBus = adEventBus.getInstance();

    /////////// INITIALIZATION


    /**
     * [_onMainVideoLoadStart description]
     * @return {[type]} [description]
     */
    var _onMainVideoLoadStart = function() {
            _mainVideo.removeEventListener("loadstart", _onMainVideoLoadStart);
            _analyseTriggers();
        },

        _onPlaying = function() {
            console.log('pause main video');
            _mainVideo.removeEventListener("playing", _onPlaying);
            _mainVideo.pause();
        },

        _analyseTriggers = function() { //    Look for preRoll ads triggers 
            var i, j, k,
                preRoll = false;

            for (i = 0; i < _mastTriggers.length; i++) {
                var trigger = _mastTriggers[i];
                if (trigger.alreadyPlayed || trigger.startConditions == []) {
                    continue;
                }
                var flag = false;
                for (j = 0; j < trigger.startConditions.length; j++) {
                    if (trigger.startConditions[j].type === ConditionType.EVENT && trigger.startConditions[j].name === ConditionName.ON_ITEM_START) {
                        flag = true;
                        break;
                    } else if (trigger.startConditions[j].type === ConditionType.PROPERTY &&
                        trigger.startConditions[j].name === ConditionName.POSITION &&
                        trigger.startConditions[j].operator === ConditionOperator.GEQ &&
                        trigger.startConditions[j].value === 0) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    var medias;
                    preRoll = true;
                    for (j = 0; j < trigger.media.length; j++) {
                        for (k = 0; k < trigger.media[j].length; k++) {
                            medias = trigger.media[j][k].mediaFiles;
                            _listVastAds.push(medias);
                        }
                    }
                }
            }

            if (!_listVastAds.length) {
                // means that no medias are available, e.g. if the vast files couldn't be loaded
                preRoll = false;
            }

            if (preRoll) {
                console.log('PreRoll');
                _adsMediaPlayer.setVisible();
                _dispatchEvent("adStart");
                _mainVideo.addEventListener("playing", _onPlaying);
                _playAds();
            }
        },

        _createCues = function() {

            // sort elements by date
            _mastTriggers.sort(function(a, b) {
                if (a.startConditions[0].value < b.startConditions[0].value)
                    return -1;
                else if (a.startConditions[0].value > b.startConditions[0].value)
                    return 1;
                else
                    return 0;
            });

            // create cues according to the sorted ads
            var cues = [],
                Cue = window.VTTCue || window.TextTrackCue,
                i,
                trigger = null,
                newCue = null;

            for (i = 0; i < _mastTriggers.length; i++) {
                trigger = _mastTriggers[i];
                if (trigger.startConditions[0].type === ConditionType.PROPERTY &&
                    trigger.startConditions[0].name === ConditionName.POSITION &&
                    trigger.startConditions[0].operator === ConditionOperator.GEQ) {
                    var cue = new Cue(trigger.startConditions[0].value, trigger.startConditions[0].value + 1, i);
                    cues.push(cue);
                }
            }
            _listCues = cues;
        },

        _parseMastFile = function() {
            if (_mastFileContent !== '') {
                _mastTriggers = _mastParser.parse(_mastFileContent);
            }

            if (_mastTriggers !== []) {
                // here goes the code parsing the triggers'sources if in vast format

                var vastFileContent;
                var vastBaseUrl;
                var ind, ind1;

                var parseVast = function() {
                    var vastParser = new AdsPlayer.vast.VastParser(vastBaseUrl);
                    console.log("ind = " + ind + " ind1 = " + ind1);
                    var vastResult = vastParser.parse(vastFileContent);
                    // store result in trigger[ind][ind1]
                    _mastTriggers[ind].media.push(vastResult);
                    ind1++;
                    loadVast();
                };


                var loadVast = function() {
                    if (ind >= _mastTriggers.length) {
                        // all triggers and all ads have been processed
                        // we return;
                        _removeEventListener('vastFileLoaded', parseVast);
                        _mainVideo.addEventListener("loadstart", _onMainVideoLoadStart);
                        _dispatchEvent("mastLoaded");
                        _createCues();
                        return;
                    }

                    if (ind1 >= _mastTriggers[ind].sources.length) {
                        // a triiger is completed, go to next one.
                        ind++;
                        ind1 = 0;
                        loadVast();
                        return;
                    }

                    var uri = _mastTriggers[ind].sources[ind1].uri;
                    if (uri.indexOf('http://') === -1) {
                        uri = _mastBaseUrl + uri;
                    }
                    _fileLoader.load(uri).then(function(result) {
                        vastFileContent = result.response;
                        vastBaseUrl = result.baseUrl;
                        vastBaseUrl = "http://2is7server2.rd.francetelecom.com";
                        _eventBus.dispatchEvent({
                            type: "vastFileLoaded",
                            data: {}
                        });
                    }, function(reason) {
                        console.log(reason.message);
                        // coudn't load the vast file, try next one
                        ind1++;
                        loadVast();
                    });
                };
                _addEventListener('vastFileLoaded', parseVast);
                ind = 0;
                ind1 = 0;
                loadVast();
            }
        },


        _onError = function(e) {
            _error = e.data;
        },

        _onWarning = function(e) {
            _warning = e.data;
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
                _adsMediaPlayer.setHidden();
                console.log('play main video');
                _mainVideo.play();
            }
        },

        _onAborted = function() {
            _onEnded('ad video aborted due to error on the adsMediaPlayer, e.g. : file not found');
        },


        _playAds = function() {
            if (_listVastAds.length) {
                var videoUrls = _listVastAds.shift();
                _adsMediaPlayer.playVideo(videoUrls);
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

    var _init = function(player, adsContainer) {

            _mainPlayer = player;
            _mainVideo = player.getVideoModel().getElement();
            _adsContainer = adsContainer;
            _adsMediaPlayer = new AdsPlayer.AdsMediaPlayer();
            _adsMediaPlayer.init();
            _adsMediaPlayer.createVideoElt(_adsContainer);
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
                _mastBaseUrl = result.baseUrl;
                _mastBaseUrl = "http://2is7server2.rd.francetelecom.com";
                _dispatchEvent("mastFileLoaded");
            }, function(reason) {
                _dispatchEvent("mastNotLoaded");
            });
        },

        /**
         * Stops and resets the Ads player.
         * @method reset
         * @access public
         * @memberof AdsPlayerController#
         */
        _reset = function() {
            _mainVideo.removeEventListener("loadstart", _onMainVideoLoadStart);
            _mastTriggers = [];
            _listVastAds = [];
        },

        _stop = function() {
            _reset();
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
        stop: _stop,
        addEventListener: _addEventListener,
        load: _load.bind(this),
        getError: _getError,
        getWarning: _getWarning
    };

};

AdsPlayer.AdsPlayerController.prototype = {
    constructor: AdsPlayer.AdsPlayerController
};
