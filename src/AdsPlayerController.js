/**
 * AdsPlayerController is th main controller class for AdsPlayer module.
 * It is in charge of downloading the MAST/VAST files and orchestrates the
 * detection of triggers and playing of ad(s).
 */
AdsPlayer.AdsPlayerController = function() {

    var _mainPlayer = null,
        _mainVideo = null,
        _adsPlayerContainer = null,
        _mast = null,
        _fileLoaders = [],
        _triggerManagers = [],
        _vastPlayerManager = null,
        _mastParser = new AdsPlayer.mast.MastParser(),
        _vastParser = new AdsPlayer.vast.VastParser(),
        _errorHandler = AdsPlayer.ErrorHandler.getInstance(),
        _debug = AdsPlayer.Debug.getInstance(),
        _eventBus = AdsPlayer.EventBus.getInstance(),


        _loadVast = function(url) {
            var deferred = Q.defer(),
                fileLoader = new AdsPlayer.FileLoader(),
                vast = null;

            _debug.log("Download VAST file: " + url);
            fileLoader.load(url).then(
                function(result) {
                    _debug.log("Parse VAST file");
                    vast = _vastParser.parse(result.response);
                    vast.baseUrl = result.baseUrl;
                    deferred.resolve(vast);
                },
                function(error) {
                    if (error) {
                        _errorHandler.sendWarning(AdsPlayer.ErrorHandler.LOAD_VAST_FAILED, "Failed to load VAST file", error);
                    }
                    deferred.resolve(null);
                }
            );
            _fileLoaders.push(fileLoader);
            return deferred.promise;
        },

        _loadTriggerVasts = function(trigger) {
            var deferred = Q.defer(),
                i,
                deferLoadVasts = [],
                uri;

            for (i = 0; i < trigger.sources.length; i++) {
                uri = trigger.sources[i].uri;
                // Check for relative uri path
                if (uri.indexOf('http://') === -1) {
                    uri = _mast.baseUrl + uri;
                }
                deferLoadVasts.push(_loadVast(uri));
            }

            Q.all(deferLoadVasts).then((function() {
                // Push vast objects in the trigger in the original order
                // (this = promises returned objects)
                for (var i = 0; i < this.length; i++) {
                    if (this[i] && this[i].ad) {
                        trigger.vasts.push(this[i]);
                    }
                }
                deferred.resolve();
            }).bind(deferLoadVasts));

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
                triggerManager = new AdsPlayer.mast.TriggerManager();
                triggerManager.init(_mast.triggers[i]);
                _triggerManagers.push(triggerManager);
            }
        },

        _onVideoPlaying = function() {
            if (_vastPlayerManager) {
                _debug.log("Pause main video");
                _mainVideo.pause();
            }
        },

        _onVideoTimeupdate = function() {
            var trigger = _checkTriggersStart();
            if (trigger !== null) {
                _activateTrigger(trigger);
            }
        },

        _onVideoEnded = function() {
            // Check for end-roll triggers
            var trigger = _checkTriggersStart();
            if (trigger !== null) {
                _activateTrigger(trigger);
            }

            _checkTriggersEnd();
        },

        _pauseVideo = function () {
            if (!_mainVideo.paused) {
                _debug.log("Pause main video");
                _mainVideo.pause();
            }
        },

        _resumeVideo = function () {
            if (_mainVideo.paused) {
                _debug.log("Resume main video");
                _mainVideo.play();
            }
        },

        _onTriggerEnd = function () {
            _debug.log('End playing trigger');

            // Delete VAST player manager
            if (_vastPlayerManager) {
                _vastPlayerManager.reset();
                _vastPlayerManager = null;
            }

            // Check if another trigger has to be activated
            var trigger = _checkTriggersStart();
            if (trigger !== null) {
                _activateTrigger(trigger);
            } else {
                // Notifies the application ad(s) playback has ended
                _eventBus.dispatchEvent({type: 'end', data: null});

                if (!_mainVideo.ended) {
                    // Resume the main video element
                    _resumeVideo();
                }
            }
        },

        _playTrigger = function (trigger) {
            if (trigger.vasts.length === 0) {
                return;
            }

            // Pause the main video element
            _pauseVideo();

            // Notifies the application ad(s) playback starts
            _eventBus.dispatchEvent({type: 'start', data: null});

            // Wait for trigger end
            _eventBus.addEventListener('triggerEnd', _onTriggerEnd);

            // Play the trigger
            _debug.log('Start playing trigger ' + trigger.id);
            _vastPlayerManager = new AdsPlayer.vast.VastPlayerManager();
            _vastPlayerManager.init(trigger.vasts, _adsPlayerContainer, _mainVideo);
            _vastPlayerManager.start();
        },

        _activateTrigger = function (trigger) {

            // Check if a trigger is not already activated
            if (_vastPlayerManager) {
                return;
            }

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

        _checkTriggersStart = function() {
            for (var i = 0; i < _triggerManagers.length; i++) {
                if (_triggerManagers[i].checkStartConditions(_mainVideo)) {
                    return _triggerManagers[i].getTrigger();
                }
            }
            return null;
        },

        _checkTriggersEnd = function() {
            for (var i = 0; i < _triggerManagers.length; i++) {
                if (_triggerManagers[i].checkEndConditions(_mainVideo)) {
                    // Remove trigger manager => will not be activated anymore
                    _triggerManagers.splice(0, 1);
                    i--;
                }
            }
        },

        _start = function() {
            if (!_mast) {
                return;
            }

            if (_mast.triggers.length === 0) {
                _debug.warn('No trigger in MAST');
            }

            // Check for pre-roll trigger
            var trigger = _checkTriggersStart();
            if (trigger !== null) {
                _activateTrigger(trigger);
            }
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
         * @param {Object} adsPlayerContainer - The container to create the HTML5 video/image elements used to play and render the ads media
         */
        init : function(player, adsPlayerContainer) {
            _mainPlayer = player;
            _mainVideo = player.getVideoModel().getElement();
            _adsPlayerContainer = adsPlayerContainer;

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
            var deferred = Q.defer(),
                fileLoader = new AdsPlayer.FileLoader();

            // Reset the MAST and trigger managers
            _mast = null;
            _triggerManagers = [];

            // Download and parse MAST file
            _debug.log("Download MAST file: " + url);
            fileLoader.load(url).then(function(result) {
                _debug.log("Parse MAST file");
                _parseMastFile(result.response, result.baseUrl);
                // Start managing triggers and ads playing
                _debug.log("Start");
                _start();
                deferred.resolve();
            }, function(error) {
                if (error) {
                    _errorHandler.sendError(error.name, error.message, error.data);
                    deferred.reject(error);
                } else {
                    deferred.resolve();
                }
            });
            _fileLoaders.push(fileLoader);

            return deferred.promise;
        },

        /**
         * Stops and resets the Ads player.
         * @method reset
         * @access public
         * @memberof AdsPlayerController#
         */
        stop : function() {

            _debug.log("Stop");

            // Stop/abort the file loaders
            for (var i = 0; i < _fileLoaders.length; i++) {
                _fileLoaders[i].abort();
            }
            _fileLoaders = [];

            // Stop the ad player
            if (_vastPlayerManager) {
                _vastPlayerManager.stop();
                _vastPlayerManager.reset();
                _vastPlayerManager = null;

                // Notifies the application ad(s) playback has ended
                _eventBus.dispatchEvent({type: 'end', data: null});
            }
        },

        reset : function() {

            _debug.log("Reset");

            this.stop();

            // Reset the trigger managers
            _triggerManagers = [];

            // Reset the MAST
            _mast = null;
        },

        destroy: function() {

            _debug.log("Destroy");

            this.reset();

            // Remove <video> event listener
            _mainVideo.removeEventListener('playing', _onVideoPlaying);
            _mainVideo.removeEventListener('timeupdate', _onVideoTimeupdate);
            _mainVideo.removeEventListener('seeking', _onVideoTimeupdate);
            _mainVideo.removeEventListener('ended', _onVideoEnded);
        },

        /**
         * Plays/resumes the playback of the current ad.
         * @method reset
         * @access public
         * @memberof AdsPlayerController#
         */
        play : function() {

            _debug.log("Play");
            // Play the ad player
            if (_vastPlayerManager) {
                _vastPlayerManager.play();
            }
        },

        /**
         * Pauses the playback of the current ad.
         * @method reset
         * @access public
         * @memberof AdsPlayerController#
         */
        pause : function() {

            _debug.log("Pause");
            // Stop the ad player
            if (_vastPlayerManager) {
                _vastPlayerManager.pause();
            }
        }
    };

};

AdsPlayer.AdsPlayerController.prototype = {
    constructor: AdsPlayer.AdsPlayerController
};