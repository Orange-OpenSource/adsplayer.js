/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2016, Orange
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
AdsPlayer.Mast.MastParser = function () {
    "use strict";

    var _parser = new AdsPlayer.utils.DOMParser(),
        _xmlDoc = null,

        _createXmlTree = function(data) {
            _xmlDoc=_parser.createXmlTree(data);
        },

        _getTriggersList = function() {
            if (_xmlDoc) {
                return _parser.getChildNodes(_parser.getChildNode(_parser.getChildNode(_xmlDoc, 'MAST'), 'triggers'), 'trigger');
            }
            return [];
        },

        _getTriggerStartConditions = function(trigger) {
            if (trigger) {
                return _parser.getChildNodes(_parser.getChildNode(trigger, 'startConditions'), 'condition');
            }
            return [];
        },

        _getTriggerId = function(trigger) {
            if (trigger) {
                return _parser.getAttributeValue(trigger, 'id');;
            }

            return '';
        },

        _getTriggerDescription = function(trigger) {
            if (trigger) {
                return _parser.getAttributeValue(trigger, 'description');
            }
            return '';
        },

        _getTriggerEndConditions = function(trigger) {
            if (trigger) {
                return _parser.getChildNodes(_parser.getChildNode(trigger, 'endConditions'), 'condition');
            }
            return [];
        },

        _getTriggerSources = function(trigger) {
            if (trigger) {
                return _parser.getChildNodes(_parser.getChildNode(trigger, 'sources'), 'source');
            }
            return [];
        },

        _getSourceUri = function(source) {
            if (source) {
                return _parser.getAttributeValue(source, 'uri');
            }
            return null;
        },

        /*
            Parsing of conditions
        */
        _getConditionType = function(condition) {
            if (condition) {
                if (_parser.getAttributeValue(condition, 'type') === 'property') {
                    if (_parser.getAttributeValue(condition, 'name') === 'Position') {
                        return "midRoll";
                    }
                }
                else if (_parser.getAttributeValue(condition, 'type') === 'event') {
                    if (_parser.getAttributeValue(condition, 'name') === 'OnItemStart') {
                        return "preRoll";
                    }
                    else if (_parser.getAttributeValue(condition, 'name') === 'OnItemEnd') {
                        return "endRoll";
                    }
                }
            }
            return '';
        },

        _getConditionPosition = function(condition) {
            if (condition) {
                if (_parser.getAttributeValue(condition, 'type') === 'property') {
                    if (_parser.getAttributeValue(condition, 'name') === 'Position') {
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
            if(timingStr == null) {
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
            if(conditions !== []) {
              var cond = [];
              for(j = 0; j < conditions.length ; j++){
                var condition = new AdsPlayer.Mast.Trigger.Condition();
                condition.type = _parser.getAttributeValue(conditions[j], 'type');
                condition.name = _parser.getAttributeValue(conditions[j], 'name');
                condition.value = __parseTimings(_parser.getAttributeValue(conditions[j], 'value'));
                condition.operator = _parser.getAttributeValue(conditions[j], 'operator');
                condition.conditions=_getConditions(_parser.getChildNodes(conditions[j],'conditions') );
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
            if(sources !== []) {
              var src = [];
              for(j = 0; j < sources.length ; j++){
                var source = new AdsPlayer.Mast.Trigger.Source();
                source.uri = _parser.getAttributeValue(sources[j], 'uri');
                source.altReference = _parser.getAttributeValue(sources[j], 'altReference');
                source.format = _parser.getAttributeValue(sources[j], 'format');
                source.sources=_getSources(_parser.getChildNodes(sources[j],'sources') );
                src.push(source);
              }
              return src;
            }
            return [];
        },

        /*
            Parsing of the xml content to get the triggers (main function)
        */  
        _parse = function(mastFileContent) {
            // Mast client
            var triggers = [];                 // will contain a description of each trigger contained in the mast file under consideration
            var triggersList = [];
            var i;

            _createXmlTree(mastFileContent);   // get the DOM

            triggersList = _getTriggersList();
            for (i = 0 ; i < triggersList.length ; i++) {
              console.log('trigger #'+i+':');
              var trigger = new AdsPlayer.Mast.Trigger();

              trigger.id=_getTriggerId(triggersList[i]);
              trigger.description=_getTriggerDescription(triggersList[i]);

              var startConditions = _getTriggerStartConditions(triggersList[i]);
              trigger.startConditions=_getConditions(startConditions);

              var endConditions = _getTriggerEndConditions(triggersList[i]);
              trigger.endConditions=_getConditions(endConditions);

              var sources=_getTriggerSources(triggersList[i]);
              trigger.sources=_getSources(sources);
              
              console.log(trigger);
              console.log('');
              triggers.push(trigger);
            }
            return triggers;
        };

    return {

        init: function () {
        },

        reset: function () {
        },

        parse: function (mastFileContent) {
            return _parse(mastFileContent);
        }
    };
};

AdsPlayer.Mast.MastParser.prototype = {
    constructor: AdsPlayer.Mast.MastParser
};
