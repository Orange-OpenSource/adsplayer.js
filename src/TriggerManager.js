
/**
 * The TriggerManager manages the detection of the start and end of a trigger.
 * It takes as input a trigger object (as parsed from a MAST file) and tests the start and end conditions
 * to detect the activation and revocation of a trigger. 
 */
AdsPlayer.TriggerManager = function() {

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
        _eventBus = AdsPlayer.EventBus.getInstance(),

        _parseTime = function(str) {
            var timeParts,
                SECONDS_IN_HOUR = 60 * 60,
                SECONDS_IN_MIN = 60;

            if (!str) {
                return -1;
            }

            timeParts = str.split(':');

            // Check time format, must be HH:MM:SS(.mmm)
            if (timeParts.length !== 3) {
                return -1;
            }

            return  (parseInt(timeParts[0]) * SECONDS_IN_HOUR) + 
                    (parseInt(timeParts[1]) * SECONDS_IN_MIN) + 
                    (parseFloat(timeParts[2]));
        },

        _compareValues = function (value1, value2, operator) {
            var res = false;

            if (value1 < 0 || value2 < 0) {
                return false;
            }

            switch (operator) {
                case ConditionOperator.EQ:
                    res = (value1 === value2);
                    break;
                case ConditionOperator.NEQ:
                    res = (value1 !== value2);
                    break;
                case ConditionOperator.GTR:
                    res = (value1 > value2);
                    break;
                case ConditionOperator.GEQ:
                    res = (value1 >= value2);
                    break;
                case ConditionOperator.LT:
                    res = (value1 < value2);
                    break;
                case ConditionOperator.LEQ:
                    res = (value1 <= value2);
                    break;
                case ConditionOperator.MOD:
                    res = ((value1 % value2) === 0);
                    break;
                default:
                    break;
            }
            return res;
        },
    
        _evaluateCondition = function (condition, video, itemStart, itemEnd) {
            var res = false,
                i;

            // Check pre-roll condition for activation
            if (itemStart && condition.type === ConditionType.EVENT && condition.name === ConditionName.ON_ITEM_START) {
                res = true;
            }

            // Check mid-roll condition for activation
            if (condition.type === ConditionType.PROPERTY) {
                switch (condition.name) {
                    case ConditionName.POSITION:
                        res = _compareValues(_parseTime(condition.value), video.currentTime, condition.operator);
                        break;
                    case ConditionName.DURATION:
                        res = _compareValues(_parseTime(condition.value), video.duration, condition.operator);
                        break;
                    default:
                        break;
                }
            }

            // Check condition for revocation
            if (itemEnd && condition.type === ConditionType.EVENT && condition.name === ConditionName.ON_ITEM_END) {
                res = true;
            }

            // AND with sub-conditions
            // MAST spec. : "Child conditions are treated as an implicit AND, all children of a condition must evaluate true before a trigger will fire (or be revoked) from that condition."
            for (i = 0; i < condition.conditions.length; i++) {
                res &= _evaluateCondition(condition.conditions[i], video);
            }

            return res;
        },

        _evaluateConditions = function (conditions, video, itemStart, itemEnd) {
            var res = false,
                i;

            // Evaluate each condition
            // MAST spec. : "Multiple condition elements are treated as an implicit OR, any one of them evaluating true will fire the trigger."
            for (i = 0; i < conditions.length; i++) {
                res |=  _evaluateCondition(conditions[i], video, itemStart, itemEnd);
            }

            return res;
        };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    return {

        /**
         * Initializes the TriggerManager.
         * @method init
         * @access public
         * @memberof TriggerManager#
         * @param {Object} trigger - the trigger to handle by this manager
         */        
        init: function(trigger) {
            _trigger = trigger;
        },

        /**
         * Returns the trigger object managed by this TriggerManager.
         * @method init
         * @access public
         * @memberof TriggerManager#
         * @return {Object} the managed trigger object
         */        
        getTrigger: function() {
            return _trigger;
        },

        /**
         * Evaluates the trigger start conditions.
         * @method checkStartConditions
         * @access public
         * @memberof TriggerManager#
         * @param {Number} video - the main video element
         * @param {Boolean} itemStart - if the item will start to play (for checking pre-roll condition) 
         */
        checkStartConditions: function(video, itemStart) {
            return _evaluateConditions(_trigger.startConditions, video, itemStart, false);
        },

        /**
         * Evaluates the trigger end conditions.
         * @method checkEndConditions
         * @access public
         * @memberof TriggerManager#
         * @param {Number} video - the main video element
         */
        checkEndConditions: function (video) {
            return _evaluateConditions(_trigger.endConditions, video, false, true);
        },

        /**
         * Activates the trigger.
         * @method activate
         * @access public
         * @memberof TriggerManager#
         */
        activate: function () {
            var deferred = Q.defer(); 
            if (_trigger.ads.length === 0) {
                _loadTrigger();
            }

            return deferred.promise;
        },

    };

};

AdsPlayer.TriggerManager.prototype = {
    constructor: AdsPlayer.TriggerManager
};