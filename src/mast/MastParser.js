/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Digital Primates
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

//AdsPlayer.mast.MastParser = function () {
AdsPlayer.mast.MastParser = function() {
    "use strict";
    var _parser = new AdsPlayer.utils.DOMParser(),
        _debug = AdsPlayer.Debug.getInstance();


    var _getTriggersList = function(mastDom) {
            // s'assurer que le fils 'triggers' existe
            var mastNode = null,
                triggersNode = null,
                trigerNode = null;

            mastNode = _parser.getChildNode(mastDom, 'MAST');
            if (!mastNode) {
                return [];
            }
            triggersNode = _parser.getChildNode(mastNode, 'triggers');
            if (!triggersNode) {
                return [];
            }

            return _parser.getChildNodes(triggersNode, 'trigger');
        },

        _parseTriggersList = function(triggersList) {
            var i,
                triggers = [];

            for (i = 0; i < triggersList.length; i++) {
                _debug.log('trigger #' + i + ':');
                var trigger = new AdsPlayer.mast.model.Trigger();

                trigger.id = _parser.getAttributeValue(triggersList[i], 'id');
                trigger.description = _parser.getAttributeValue(triggersList[i], 'description');

                var startConditions = _getTriggerValues(triggersList[i], 'startConditions', 'condition');
                trigger.startConditions = _getConditions(startConditions);

                var endConditions = _getTriggerValues(triggersList[i], 'endConditions', 'condition');
                trigger.endConditions = _getConditions(endConditions);

                var sources = _getTriggerValues(triggersList[i], 'sources', 'source');
                trigger.sources = _getSources(sources);

                _debug.log(trigger);
                _debug.log('');
                triggers.push(trigger);
            }

            return triggers;
        },

        _getTriggerValues = function(trigger, mainNodeName, subNodesName) {
            var mainNode;
            if (trigger) {
                mainNode = _parser.getChildNode(trigger, mainNodeName);
                if (mainNode) {
                    return _parser.getChildNodes(mainNode, subNodesName);
                }
            }
            return [];
        },


        /*
            Parsing of conditions
        */
        _getConditionType = function(condition) {
            if (condition) {
                if (_parser.getAttributeValue(condition, 'type') === ConditionType.PROPERTY) {
                    if (_parser.getAttributeValue(condition, 'name') === ConditionName.POSITION) {
                        return "midRoll";
                    }
                } else if (_parser.getAttributeValue(condition, 'type') === ConditionType.EVENT) {
                    if (_parser.getAttributeValue(condition, 'name') === ConditionType.ON_ITEM_START) {
                        return "preRoll";
                    } else if (_parser.getAttributeValue(condition, 'name') === ConditionType.ON_ITEM_END) {
                        return "endRoll";
                    }
                }
            }
            return '';
        },

        _getConditionPosition = function(condition) {
            if (condition) {
                if (_parser.getAttributeValue(condition, 'type') === ConditionType.PROPERTY) {
                    if (_parser.getAttributeValue(condition, 'name') === ConditionType.EVENT) {
                        return __parseTimings(_parser.getAttributeValue(condition, 'value'));
                    }
                }
            }
            return '';
        },

        __parseTimings = function(timingStr) {
            var timeParts,
                parsedTime,
                SECONDS_IN_HOUR = 60 * 60,
                SECONDS_IN_MIN = 60;
            if (timingStr === null) {
                return -1;
            }
            timeParts = timingStr.split(":");

            parsedTime = (parseFloat(timeParts[0]) * SECONDS_IN_HOUR +
                parseFloat(timeParts[1]) * SECONDS_IN_MIN +
                parseFloat(timeParts[2]));

            return parsedTime;
        },

        _getConditions = function(conditions) {
            var j;
            if (conditions !== []) {
                var cond = [];
                for (j = 0; j < conditions.length; j++) {
                    var condition = new AdsPlayer.mast.model.Trigger.Condition();
                    condition.type = _parser.getAttributeValue(conditions[j], 'type');
                    condition.name = _parser.getAttributeValue(conditions[j], 'name');
                    condition.value = __parseTimings(_parser.getAttributeValue(conditions[j], 'value'));
                    condition.operator = _parser.getAttributeValue(conditions[j], 'operator');
                    condition.conditions = _getConditions(_parser.getChildNodes(conditions[j], 'conditions'));
                    cond.push(condition);
                }
                return cond;
            }
            return [];
        },

        /*
            Parsing of sources (vast files)
        */
        _getSources = function(sources) {
            var j;
            if (sources !== []) {
                var src = [];
                for (j = 0; j < sources.length; j++) {
                    var source = new AdsPlayer.mast.model.Trigger.Source();
                    source.uri = _parser.getAttributeValue(sources[j], 'uri');
                    source.altReference = _parser.getAttributeValue(sources[j], 'altReference');
                    source.format = _parser.getAttributeValue(sources[j], 'format');
                    source.sources = _getSources(_parser.getChildNodes(sources[j], 'sources'));
                    src.push(source);
                }
                return src;
            }
            return [];
        },

        /*
            Parsing of the xml content to get the triggers (main function)
        */
        _parse = function(mastDom) {
            // Mast client

            var triggers = [], // will contain a description of each trigger contained in the mast file under consideration
                triggersList = [],
                mast = new AdsPlayer.mast.model.Mast();

            triggersList = _getTriggersList(mastDom);
            triggers = _parseTriggersList(triggersList);
            mast.triggers = triggers;

            return mast;
        };

    return {

        init: function() {},

        reset: function() {},

        parse: function(mastDom) {
            return _parse(mastDom);
        }
    };
};

AdsPlayer.mast.MastParser.prototype = {
    constructor: AdsPlayer.mast.MastParser
};