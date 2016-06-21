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
        _playerContainer = null,
        _adsContainer = null,
        _mast = null,
        _triggerManagers = [],
        _adsPlayerManager = null,
        _onMainVideoPlayingListener = null,
        _fileLoader = new AdsPlayer.FileLoader(),
        _mastParser = new AdsPlayer.mast.MastParser(),
        _vastParser = new AdsPlayer.vast.VastParser(),
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance();

    /////////// INITIALIZATION

    /**
     * [_onMainVideoLoadStart description]
     * @return {[type]} [description]
     */
    var /*_onMainVideoLoadStart = function() {
            _mainVideo.removeEventListener("loadstart", _onMainVideoLoadStart);
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                _mainVideo.addEventListener('timeupdate', _onTimeChange);
            } else {
                _addTextTrackCues();
            }
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
            var j,
                k;

            if (id < 0 || id >= _mastTriggers.length)
                return;

            var trigger = _mastTriggers[id];
            if (trigger.alreadyProcessed || trigger.startConditions == []) {
                return;
            }
            trigger.alreadyProcessed = true;
            for (j = 0; j < trigger.ads.length; j++) {
                _listVastAds.push(trigger.ads[j]);
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
            _debug.log('video timestamp :' + _mainVideo.currentTime);
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

        _onTimeChange = function() {
            var changedTime = _mainVideo.currentTime;
            if (changedTime === 0) {
                return; // to avoid overlapp with preRoll
            }
            _debug.log('timeChange at  :' + changedTime);
            for (i = 0; i < _mastTriggers.length; i++) {
                var trigger = _mastTriggers[i];
                if (trigger.alreadyProcessed || trigger.startConditions == []) {
                    continue;
                }
                for (j = 0; j < trigger.startConditions.length; j++) {
                    if (trigger.startConditions[j].type === ConditionType.PROPERTY &&
                        trigger.startConditions[j].name === ConditionName.POSITION &&
                        trigger.startConditions[j].operator === ConditionOperator.GEQ &&
                        trigger.startConditions[j].value < changedTime) {
                        _analyseTrigger(i);
                        break;
                    }
                }
            }
            _startPlayAds('_onTimeChange');
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

        _getVastInfo = function(vast) {
            var listAds = [],
                creative,
                ad;

            for (i = 0; i < vast.ads.length; i++) {
                ad = {
                    adSystem: '',
                    adTitle: '',
                    description: '',
                    survey: '',
                    error: '',
                    impression: '',
                    creatives: []
                };
                ad.adSystem = vast.ads[i].inLine.adSystem;
                ad.impression = vast.ads[i].inLine.impression;
                for (j = 0; j < vast.ads[i].inLine.creatives.length; j++) {
                    creative = {
                        id: '',
                        sequence: '',
                        AdID: '',
                        linear: null
                    };

                    creative.id = vast.ads[i].inLine.creatives[j].id;
                    //                  ad.creative.sequence=vast.ads[i].inLine.creatives[j].sequence;
                    //                 ad.creative.AdID=vast.ads[i].inLine.creatives[j].AdID;
                    if (vast.ads[i].inLine.creatives[j].linear) {
                        creative.linear = vast.ads[i].inLine.creatives[j].linear;
                    }
                    if (creative.linear !== null) {
                        ad.creatives.push(creative);
                    }
                }
                if (ad.creatives != []) {
                    listAds.push(ad);
                }
            }
            return listAds;
        },*/

        _loadVast = function(trigger, url) {
            var deferred = Q.defer(),
                vast = null;

            _debug.log("Download VAST file: " + url);
            _fileLoader.load(url).then(
                function(result) {
                    _debug.log("Parse VAST file");
                    vast = _vastParser.parse(result.response);
                    vast.baseUrl = result.baseUrl;
                    trigger.vasts.push(vast);
                    deferred.resolve();
                },
                function(error) {
                    _errorHandler.sendWarning(AdsPlayer.ErrorHandler.LOAD_VAST_FAILED, "Failed to load VAST file", error);
                    deferred.resolve();
                }
            );
            return deferred.promise;
        },

        _loadTriggerVasts = function(trigger) {
            var deferred = Q.defer(),
                i,
                deferLoadVasts = [],
                uri;

            for (i = 0; i < trigger.sources.length; i++) {
                uri = trigger.sources[i].uri;
                // check for relative uri path
                if (uri.indexOf('http://') === -1) {
                    uri = _mast.baseUrl + uri;
                }
                deferLoadVasts.push(_loadVast(trigger, uri));
            }

            Q.all(deferLoadVasts).then(function() {
                deferred.resolve();
            });

            return deferred.promise;
        },

        _parseMastFile = function(mastContent, mastBaseUrl) {
            var triggerManager,
                i;

            // Parse the MAST file
            _mast = _mastParser.parse(mastContent);

            if (!_mast) {
                return;
            }

            // Store base URL for subsequent VATS files download
            _mast.baseUrl = mastBaseUrl;

            // Initialize the trigger managers
            for (i = 0; i < _mast.triggers.length; i++) {
                triggerManager = new AdsPlayer.TriggerManager();
                triggerManager.init(_mast.triggers[i]);
                _triggerManagers.push(triggerManager);
            }
        },

        _onVideoPlaying = function() {
            if (_adsPlayerManager) {
                _debug.log("Pause main video");
                _mainVideo.pause();
                //_mainVideo.removeEventListener("playing", _onMainVideoPlayingListener);
            }
        },

        _onVideoTimeupdate = function() {
            _checkTriggersStart(false);
        },

        _onVideoEnded = function() {
            _checkTriggersEnd();
        },

        _pauseVideo = function () {
            if (!_mainVideo.paused) {
                _debug.log("Pause main video");
                _mainVideo.pause();
            }
        },

        _resumeVideo = function () {
            //_mainVideo.removeEventListener("playing", _onMainVideoPlayingListener);
            if (_mainVideo.paused) {
                _debug.log("Resume main video");
                _mainVideo.play();
            }
        },

        _showMainPlayer = function (show) {
            _playerContainer.style.visibility = show ? 'visible' : 'hidden';
        },

        _onTriggerEnd = function () {
            _debug.log('End playing trigger');

            if (_adsPlayerManager) {
                _adsPlayerManager.stop();
                _adsPlayerManager = null;
            }

            // Show the main player
            _showMainPlayer(true);
            
            // Resume the main video element
            _resumeVideo();
        },

        _playTrigger = function (trigger) {
            if (trigger.vasts.length === 0) {
                return;
            }

            // Pause the main video element
            _pauseVideo();

            // Hide the main player
            _showMainPlayer(false);

            // Wait for trigger end
            _eventBus.addEventListener('adTriggerEnd', _onTriggerEnd);

            // Play the trigger
            _debug.log('Start playing trigger ' + trigger.id);
            _adsPlayerManager = new AdsPlayer.AdsPlayerManager();
            _adsPlayerManager.init(trigger.vasts, _adsContainer);
            _adsPlayerManager.start();
        },

        _activateTrigger = function (trigger) {

            _debug.log('Activate trigger ' + trigger.id);
            trigger.activated = true;
            if (trigger.vasts.length === 0) {
                // Download VAST files
                _loadTriggerVasts(trigger).then(function () {
                    _playTrigger(trigger);
                });
            } else {
                _playTrigger(trigger);
            }
        },

        _checkTriggersStart = function(itemStart) {
            for (var i = 0; i < _triggerManagers.length; i++) {
                if (_triggerManagers[i].checkStartConditions(_mainVideo, itemStart)) {
                    _activateTrigger(_triggerManagers[i].getTrigger());
                    break;
                }
            }
        },

        _checkTriggersEnd = function() {
            for (var i = 0; i < _triggerManagers.length; i++) {
                if (_triggerManagers[i].checkEndConditions(_mainVideo)) {
                    // Remove trigger manager => will not be activated anymore 
                    _debug.log('Revocate trigger ' + trigger.id);
                    _triggerManagers.splice(0, 1);
                    i--;
                }
            }
        },

        _start = function() {
            if (!_mast) {
                return;
            }
            // Check for pre-roll trigger
            _checkTriggersStart(true);
        };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    return {

        /**
         * Initialize the Ads Player Controller.
         * @method init
         * @access public
         * @memberof AdsPlayerController#
         * @param {Object} mainVideo - the HTML5 video element used by the main media player
         * @param {Object} adsContainer - The container to create the HTML5 video element used to play and render the Ads video streams
         */
        init : function(player, playerContainer, adsContainer) {
            _mainPlayer = player;
            _mainVideo = player.getVideoModel().getElement();
            _playerContainer = playerContainer;
            _adsContainer = adsContainer;
            _onMainVideoPlayingListener = _onVideoPlaying.bind(this);

            // Add <video> event listener
            _mainVideo.addEventListener('playing', _onVideoPlaying);
            _mainVideo.addEventListener('timeupdate', _onVideoTimeupdate);
            _mainVideo.addEventListener('seeking', _onVideoTimeupdate);
            _mainVideo.addEventListener('ended', _onVideoEnded);

            _debug.setLevel(4);
        },


        /**
         * Load/open a MAST file.
         * @method load
         * @access public
         * @memberof AdsPlayerController#
         * @param {string} mastUrl - the MAST file url
         */
        load : function(url) {
            var deferred = Q.defer();

            // Reset the MAST and trigger managers
            _mast = null;
            _triggerManagers = [];

            // Download and parse MAST file
            _debug.log("Download MAST file: " + url);
            _fileLoader.load(url).then(function(result) {
                _debug.log("Parse MAST file");
                _parseMastFile(result.response, result.baseUrl);
                // Start managing triggers and ads playing
                _debug.log("Start");
                _start();
                deferred.resolve();
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },

        /**
         * Stops and resets the Ads player.
         * @method reset
         * @access public
         * @memberof AdsPlayerController#
         */
        stop : function() {

            //_mainVideo.removeEventListener("playing", _onMainVideoPlayingListener);
            
            // Stop the ad player
            if (_adsPlayerManager) {
                _adsPlayerManager.stop();
                _adsPlayerManager = null;
            }

            // Show the main player
            _showMainPlayer(true);
        },

        reset : function() {
            
            stop();

            // Remove <video> event listener
            _mainVideo.removeEventListener('playing', _onVideoPlaying);
            _mainVideo.removeEventListener('timeupdate', _onVideoTimeupdate);
            _mainVideo.removeEventListener('seeking', _onVideoTimeupdate);            
            _mainVideo.removeEventListener('ended', _onVideoEnded);            

            // Reset the trigger managers
            _triggerManagers = [];

            // Reset the MAST
            _mast = null;
        }
    };

};

AdsPlayer.AdsPlayerController.prototype = {
    constructor: AdsPlayer.AdsPlayerController
};