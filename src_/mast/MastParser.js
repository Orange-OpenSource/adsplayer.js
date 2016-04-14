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
AdsPlayer.MastParser = function() {
    "use strict";
    this.parser = new AdsPlayer.utils.DOMParser();
    this._xmlDoc=null;
    var that = this;
};

AdsPlayer.MastParser.prototype = {
    constructor: AdsPlayer.MastParser
};

AdsPlayer.MastParser.prototype.createXmlTree = function(data) {
    this._xmlDoc=this.parser.createXmlTree(data);
};

AdsPlayer.MastParser.prototype.getTriggersList = function() {
    if (this._xmlDoc) {
        return this.parser.getChildNodes(this.parser.getChildNode(this.parser.getChildNode(this._xmlDoc, 'MAST'), 'triggers'), 'trigger');
    }
    return [];
};

AdsPlayer.MastParser.prototype.getTriggerStartConditions = function(trigger) {
    if (trigger) {
        return this.parser.getChildNodes(this.parser.getChildNode(trigger, 'startConditions'), 'condition');
    }
    return [];
};

AdsPlayer.MastParser.prototype.getTriggerId = function(trigger) {
    if (trigger) {
        return this.parser.getAttributeValue(trigger, 'id');;
    }
    return '';
};

AdsPlayer.MastParser.prototype.getTriggerDescription = function(trigger) {
    if (trigger) {
        return this.parser.getAttributeValue(trigger, 'description');
    }
    return '';
};

AdsPlayer.MastParser.prototype.getTriggerEndConditions = function(trigger) {
    if (trigger) {
        return this.parser.getChildNodes(this.parser.getChildNode(trigger, 'endConditions'), 'condition');
    }
    return [];
};

AdsPlayer.MastParser.prototype.getTriggerSources = function(trigger) {
    if (trigger) {
        return this.parser.getChildNodes(this.parser.getChildNode(trigger, 'sources'), 'source');
    }
    return [];
};

AdsPlayer.MastParser.prototype.getSourceUri = function(source) {
    if (source) {
        return this.parser.getAttributeValue(source, 'uri');
    }
    return null;
};

AdsPlayer.MastParser.reset = function() {
    this._xmlDoc = null;
};


/*
    Parsing of conditions
*/

AdsPlayer.MastParser.prototype.getConditionType = function(condition) {
    if (condition) {
        if (this.parser.getAttributeValue(condition, 'type') === 'property') {
            if (this.parser.getAttributeValue(condition, 'name') === 'Position') {
                return "midRoll";
            }
        }
        else if (this.parser.getAttributeValue(condition, 'type') === 'event') {
            if (this.parser.getAttributeValue(condition, 'name') === 'OnItemStart') {
                return "preRoll";
            }
            else if (this.parser.getAttributeValue(condition, 'name') === 'OnItemEnd') {
                return "endRoll";
            }
        }
    }
    return '';
};


AdsPlayer.MastParser.prototype.getConditionPosition = function(condition) {
    if (condition) {
        if (this.parser.getAttributeValue(condition, 'type') === 'property') {
            if (this.parser.getAttributeValue(condition, 'name') === 'Position') {
                return this._parseTimings(this.parser.getAttributeValue(condition, 'value'));
            }
        }
    }
    return '';
};

AdsPlayer.MastParser.prototype._parseTimings = function(timingStr) {
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
};

AdsPlayer.MastParser.prototype.getConditions = function(conditions) {
    var j;
    if(conditions !== []) {
      var cond = [];
      for(j = 0; j < conditions.length ; j++){
        var condition = new AdsPlayer.Mast.Trigger.Condition();
        condition.type = this.parser.getAttributeValue(conditions[j], 'type');
        condition.name = this.parser.getAttributeValue(conditions[j], 'name');
        condition.value = this._parseTimings(this.parser.getAttributeValue(conditions[j], 'value'));
        condition.operator = this.parser.getAttributeValue(conditions[j], 'operator');
        condition.conditions=this.getConditions(this.parser.getChildNodes(conditions[j],'conditions') );
        cond.push(condition);
      }
      return cond;
    }
    return [];
};

AdsPlayer.MastParser.prototype.getSources = function(sources) {
    var j;
    if(sources !== []) {
      var src = [];
      for(j = 0; j < sources.length ; j++){
        var source = new AdsPlayer.Mast.Trigger.Source();
        source.uri = this.parser.getAttributeValue(sources[j], 'uri');
        source.altReference = this.parser.getAttributeValue(sources[j], 'altReference');
        source.format = this.parser.getAttributeValue(sources[j], 'format');
        source.sources=this.getSources(this.parser.getChildNodes(sources[j],'sources') );
        src.push(source);
      }
      return src;
    }
    return [];
};

//
//  Below is the full parsing of the Mast file
//  It is assumed for the moment that a trigger has only one start condition, one end condition and one source
//
AdsPlayer.MastParser.prototype.parse = function(mastFileContent) {
    // Mast client
    var triggers = [];                 // will contain a description of each trigger contained in the mast file under consideration
    var triggersList = [];
    var i;

    this.createXmlTree(mastFileContent);   // get the DOM

    triggersList = this.getTriggersList();
    for (i = 0 ; i < triggersList.length ; i++) {
      console.log('trigger #'+i+':');
      var trigger = new AdsPlayer.Mast.Trigger();

      trigger.id=this.getTriggerId(triggersList[i]);
      trigger.description=this.getTriggerDescription(triggersList[i]);

      var startConditions = this.getTriggerStartConditions(triggersList[i]);
      trigger.startConditions=this.getConditions(startConditions);

      var endConditions = this.getTriggerEndConditions(triggersList[i]);
      trigger.endConditions=this.getConditions(endConditions);

      var sources=this.getTriggerSources(triggersList[i]);
      trigger.sources=this.getSources(sources);
      
      console.log(trigger);
      console.log('');
      triggers.push(trigger);
    }
    return triggers;
};
