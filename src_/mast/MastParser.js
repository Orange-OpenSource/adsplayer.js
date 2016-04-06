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
AdsPlayer.dependencies.MastParser = function() {
    "use strict";
    this.parser = new AdsPlayer.utils.DOMParser();
    this._xmlDoc=null;
};

AdsPlayer.dependencies.MastParser.prototype = {
    constructor: AdsPlayer.dependencies.MastParser
};

AdsPlayer.dependencies.MastParser.prototype.parse = function(data) {
    this._xmlDoc=this.parser.createXmlTree(data);
};

AdsPlayer.dependencies.MastParser.prototype.getTriggersList = function() {

    
    if (this._xmlDoc) {
        return this.parser.getChildNodes(this.parser.getChildNode(this.parser.getChildNode(this._xmlDoc, 'MAST'), 'triggers'), 'trigger');
    }
    return [];
    
};

AdsPlayer.dependencies.MastParser.prototype.getTriggerStartConditions = function(trigger) {
    if (trigger) {
        return this.parser.getChildNodes(this.parser.getChildNode(trigger, 'startConditions'), 'condition');
    }
    return [];
};

AdsPlayer.dependencies.MastParser.prototype.getTriggerEndConditions = function(trigger) {
    if (trigger) {
        return this.parser.getChildNodes(this.parser.getChildNode(trigger, 'endConditions'), 'condition');
    }
    return [];
};

AdsPlayer.dependencies.MastParser.prototype.getTriggerSources = function(trigger) {
    if (trigger) {
        return this.parser.getChildNodes(this.parser.getChildNode(trigger, 'sources'), 'source');
    }
    return [];
};

AdsPlayer.dependencies.MastParser.prototype.getSourceUri = function(source) {
    if (source) {
        return this.parser.getAttributeValue(source, 'uri');
    }
    return null;
};

AdsPlayer.dependencies.MastParser.reset = function() {
    this._xmlDoc = null;
};


/*
    Parsing of conditions
*/

AdsPlayer.dependencies.MastParser.prototype.getConditionType = function(condition) {
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
    return 0;
};


AdsPlayer.dependencies.MastParser.prototype.getConditionPosition = function(condition) {
    if (condition) {
        if (this.parser.getAttributeValue(condition, 'type') === 'property') {
            if (this.parser.getAttributeValue(condition, 'name') === 'Position') {
                return this._parseTimings(this.parser.getAttributeValue(condition, 'value'));
            }
        }
    }
    return 0;
};

AdsPlayer.dependencies.MastParser.prototype._parseTimings = function(timingStr) {
    var timeParts,
        parsedTime,
        SECONDS_IN_HOUR = 60 * 60,
        SECONDS_IN_MIN = 60;

    timeParts = timingStr.split(":");

    parsedTime = (parseFloat(timeParts[0]) * SECONDS_IN_HOUR +
        parseFloat(timeParts[1]) * SECONDS_IN_MIN +
        parseFloat(timeParts[2]));

    return parsedTime;
};
