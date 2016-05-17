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
        _listCues = [],
        _mastTriggers = [],
        _listVastAds = [], // this table is used to track the (groups of) ads to be played
        _fileLoader = new AdsPlayer.FileLoader(),
        _mastParser = new AdsPlayer.mast.MastParser(),
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance();

    /////////// INITIALIZATION

    /**
     * [_onMainVideoLoadStart description]
     * @return {[type]} [description]
     */
    var _onMainVideoLoadStart = function() {
            _mainVideo.removeEventListener("loadstart", _onMainVideoLoadStart);
            _addTextTrackCues();
            _analyseTriggers();
        },

        _onPlaying = function() {
            _debug.log('pause main video');
            _mainVideo.removeEventListener("playing", _onPlaying);
            _mainVideo.pause();
        },

        _analyseTriggers = function() { //    Look for preRoll ads triggers 
            var i,
                j,
                k;

            _listVastAds = [];

            for (i = 0; i < _mastTriggers.length; i++) {
                var trigger = _mastTriggers[i];
                if (trigger.alreadyProcessed || trigger.startConditions == []) {
                    continue;
                }
                var flag = false;
                for (j = 0; j < trigger.startConditions.length; j++) {
                    if (trigger.startConditions[j].type === ConditionType.EVENT && trigger.startConditions[j].name === ConditionName.ON_ITEM_START) {
                        _analyseTrigger(i);
                        break;
                    } else if (trigger.startConditions[j].type === ConditionType.PROPERTY &&
                        trigger.startConditions[j].name === ConditionName.POSITION &&
                        trigger.startConditions[j].operator === ConditionOperator.GEQ &&
                        trigger.startConditions[j].value === 0) {
                        _analyseTrigger(i);
                        break;
                    }
                }
            }

            if (_listVastAds.length === 0) {
                // means that no medias are available, e.g. if the vast files couldn't be loaded
                return;
            }

            _debug.log('PreRoll');
            _adsMediaPlayer.show(true);
            _eventBus.dispatchEvent({
                type: "adStart",
                data: {}
            });
            _mainVideo.addEventListener("playing", _onPlaying);
            _playAds();
        },

        _analyseTrigger = function(id) { //    get ads of the trigger indexed by id
            var medias,
                j,
                k;

            if (id < 0 || id >= _mastTriggers.length)
                return;

            var trigger = _mastTriggers[id];
            if (trigger.alreadyPlayed || trigger.startConditions == []) {
                return;
            }
            trigger.alreadyProcessed = true;
            for (j = 0; j < trigger.media.length; j++) {
                for (k = 0; k < trigger.media[j].length; k++) {
                    medias = trigger.media[j][k].mediaFiles;
                    medias.duration = trigger.media[j][k].duration;
                    if (trigger.media[j][k].videoClicks.clickThrough !== null) {
                        medias.clickThrough = trigger.media[j][k].videoClicks.clickThrough.uri;
                    }
                    _listVastAds.push(medias);
                }
            }
        },

        _startPlayAds = function(msg) {
            if (!_listVastAds.length) {
                return;
            }
            _debug.log(msg);
            _adsMediaPlayer.show(true);
            _eventBus.dispatchEvent({
                type: "adStart",
                data: {}
            });
            _debug.log('pause main video');
            _mainVideo.pause();
            _playAds();
        },

        _onCueEnter = function(e) {
            var ind;
            ind = parseInt(e.target.text, 10);
            _debug.log('_onCueEnter :' + ind);
            _analyseTrigger(ind);
            _startPlayAds('midRoll');
        },

        _createCues = function(listener) {

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
                    cue.onenter = listener;
                    cues.push(cue);
                }
            }
            _listCues = cues;
        },

        _addTextTrackCues = function() {
            var i,
                len = _listCues.length;
            if (len === 0) {
                return;
            }

            var track = _mainVideo.addTextTrack("chapters", "ads", "none");
            track.mode = "showing";
            for (i = 0; i < len; i++)
                track.addCue(_listCues[i]);
        },

        _clearTextTrackCues = function() {
            var textTracks = _mainVideo.textTracks; // one for each track element
            for (var c = 0; c < textTracks.length; c++) {
                var textTrack = textTracks[c];
                if (textTrack.label == 'ads') {
                    var cues = textTrack.cues;
                    for (var i = cues.length - 1; i >= 0; i--) {
                        textTrack.removeCue(cues[i]);
                    }
                }
            }
        },

        _onSeeked = function() {
            var seekedTime;
            seekedTime = _mainVideo.currentTime;
            if (seekedTime === 0) {
                return; // to avoid overlapp with preRoll
            }
            _debug.log('seeked at  :' + seekedTime);
            for (i = 0; i < _mastTriggers.length; i++) {
                var trigger = _mastTriggers[i];
                if (trigger.alreadyProcessed || trigger.startConditions == []) {
                    continue;
                }
                for (j = 0; j < trigger.startConditions.length; j++) {
                    if (trigger.startConditions[j].type === ConditionType.PROPERTY &&
                        trigger.startConditions[j].name === ConditionName.POSITION &&
                        trigger.startConditions[j].operator === ConditionOperator.GEQ &&
                        trigger.startConditions[j].value < seekedTime) {
                        _analyseTrigger(i);
                        break;
                    }
                }
            }
            _startPlayAds('seeked');
        },

        _loadVast = function(mastTrigger, vastUrl) {
            var deferred = Q.defer(),
                fileLoader = new AdsPlayer.FileLoader(),
                vastParser = null,
                vast = null;

            fileLoader.load(vastUrl).then(
                function(result) {
                    vastParser = new AdsPlayer.vast.VastParser(result.baseUrl);
                    vast = vastParser.parse(result.response);
                    mastTrigger.media.push(vast);
                    _debug.log('vast file parsed :' + vastUrl);
                    deferred.resolve();
                },
                function(error) {
                    _errorHandler.sendWarning(AdsPlayer.ErrorHandler.LOAD_VAST_FAILED, "Failed to load VAST file", error);
                    deferred.resolve();
                }
            );
            return deferred.promise;
        },

        _loadTrigger = function(mastTrigger, mastBaseUrl) {
            var i,
                deferLoadVasts = [],
                uri;
            var deferred = Q.defer();

            for (i = 0; i < mastTrigger.sources.length; i++) {
                uri = mastTrigger.sources[i].uri;
                if (uri.indexOf('http://') === -1) {
                    uri = mastBaseUrl + uri;
                }
                deferLoadVasts.push(_loadVast(mastTrigger, uri));
            }

            Q.all(deferLoadVasts).then(function() {
                deferred.resolve();
            });

            return deferred.promise;
        },

        _parseMastFile = function(mastContent, mastBaseUrl) {
            var deferred = null,
                mast,
                i,
                deferLoadTriggers;

            mast = _mastParser.parse(mastContent);
            _mastTriggers = mast.triggers;

            //_mastTriggers = _mastParser.parse(mastContent);

            if (_mastTriggers.length === 0) {
                return Q.when();
            }

            deferred = Q.defer();
            deferLoadTriggers = [];

            for (i = 0; i < _mastTriggers.length; i++) {
                deferLoadTriggers.push(_loadTrigger(_mastTriggers[i], mastBaseUrl));
            }

            Q.all(deferLoadTriggers).then(function() {
                _mainVideo.addEventListener("loadstart", _onMainVideoLoadStart);
                _createCues(_onCueEnter);
                deferred.resolve();
            });

            return deferred.promise;
        },

        _onAdEnded = function( /*msg*/ ) {
            /*if (!msg) {
                msg = 'ad video ended';
            }
            console.log(msg);*/
            if (_listVastAds.length > 0) {
                _playAds();
            } else {
                _mainVideo.removeEventListener("playing", _onPlaying);

                _debug.log('no more Ads to Play : dispatch "adEnd" towards the html Player');
                _eventBus.dispatchEvent({
                    type: "adEnd",
                    data: {}
                });
                _adsMediaPlayer.show(false);
                _debug.log('play main video');
                _mainVideo.play();
            }
        },

        /*_onAborted = function() {
            _onEnded('ad video aborted due to error on the adsMediaPlayer, e.g. : file not found');
        },*/


        _playAds = function() {
            if (_listVastAds.length > 0) {
                var medias = _listVastAds.shift();
                _adsMediaPlayer.playVideo(medias);
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
            _adsMediaPlayer.init(_adsContainer);

            _eventBus.addEventListener("adEnded", _onAdEnded);

            _mainVideo.onseeked = function() {
                _onSeeked()
            };

            _debug.setLevel(4);
        },


        /**
         * Load/open a MAST file.
         * @method load
         * @access public
         * @memberof AdsPlayerController#
         * @param {string} mastUrl - the MAST file url
         */
        _load = function(url) {
            var deferred = Q.defer();

            _fileLoader.load(url).then(function(result) {
                _debug.log("MAST file loaded");
                _parseMastFile(result.response, result.baseUrl).then(function() {
                    deferred.resolve();
                });
            }, function(error) {
                /*_({
                    type: "error",
                    data: error
                });*/
                deferred.reject();
            });

            return deferred.promise;
        },

        /**
         * Stops and resets the Ads player.
         * @method reset
         * @access public
         * @memberof AdsPlayerController#
         */
        _reset = function() {
            _clearTextTrackCues();
            _mainVideo.removeEventListener("loadstart", _onMainVideoLoadStart);
            _mastTriggers = [];
            _listVastAds = [];
        },

        _stop = function() {
            _reset();
            _adsMediaPlayer.reset();
        };

    return {
        init: _init,
        stop: _stop,
        load: _load
    };

};

AdsPlayer.AdsPlayerController.prototype = {
    constructor: AdsPlayer.AdsPlayerController
};