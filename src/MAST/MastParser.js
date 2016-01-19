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
    this._parser = null;
    this._xmlDoc = null;
};

AdsPlayer.dependencies.MastParser.prototype = {
    constructor: AdsPlayer.dependencies.MastParser
};

AdsPlayer.dependencies.MastParser.prototype.parse = function(data) {
    if (window.DOMParser) {
        try {
            if (!this._parser) {
                this._parser = new window.DOMParser();
            }

            this._xmlDoc = this._parser.parseFromString(data, "text/xml");
            if (this._xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('Error parsing XML');
            }
        } catch (e) {
            console.log("[MastParser] Parsing error " + e);
            this._xmlDoc = null;
        }
    }
    return this._xmlDoc;
};

AdsPlayer.dependencies.MastParser.prototype.getTriggersList = function() {
    if (this._xmlDoc) {
        return this._getChildNodes(this._getChildNode(this._getChildNode(this._xmlDoc, 'MAST'), 'triggers'), 'trigger');
    }
    return [];
};

AdsPlayer.dependencies.MastParser.prototype.getTriggerStartConditions = function(trigger) {
    if (trigger) {
        return this._getChildNodes(this._getChildNode(trigger, 'startConditions'), 'condition');
    }
    return [];
};

AdsPlayer.dependencies.MastParser.prototype.getTriggerEndConditions = function(trigger) {
    if (trigger) {
        return this._getChildNodes(this._getChildNode(trigger, 'endConditions'), 'condition');
    }
    return [];
};

AdsPlayer.dependencies.MastParser.prototype.getTriggerSources = function(trigger) {
    if (trigger) {
        return this._getChildNodes(this._getChildNode(trigger, 'sources'), 'source');
    }
    return [];
};

AdsPlayer.dependencies.MastParser.prototype.getSourceUri = function(source) {
    if (source) {
        return this._getAttributeValue(source, 'uri');
    }
    return null;
};

AdsPlayer.dependencies.MastParser.reset = function() {
    this._xmlDoc = null;
};

AdsPlayer.dependencies.MastParser.prototype.getConditionPosition = function(condition) {
    if (condition) {
        if (this._getAttributeValue(condition, 'type') === 'property') {
            if (this._getAttributeValue(condition, 'name') === 'Position') {
                return this._parseTimings(this._getAttributeValue(condition, 'value'));
            }
        }
    }
    return null;
};
/************************************************** PRIVATE FUNCTIONS *************************************************************************/
AdsPlayer.dependencies.MastParser.prototype._getChildNodes = function(nodeParent, childName) {
    var i = 0,
        element = [];

    if (nodeParent && nodeParent.childNodes) {
        for (i = 0; i < nodeParent.childNodes.length; i += 1) {
            if (nodeParent.childNodes[i].nodeName === childName) {
                element.push(nodeParent.childNodes[i]);
            }
        }
    }

    return element;
};

AdsPlayer.dependencies.MastParser.prototype._getChildNode = function(nodeParent, childName) {
    var i = 0,
        element;

    if (nodeParent && nodeParent.childNodes) {
        for (i = 0; i < nodeParent.childNodes.length; i += 1) {
            element = nodeParent.childNodes[i];
            if (element.nodeName === childName) {
                return element;
            }
            element = undefined;
        }
    }

    return element;
};

AdsPlayer.dependencies.MastParser.prototype._getAttributeValue = function(node, attrName) {
    var returnValue = null,
        domElem = null,
        attribList = null;

    if (node && node.attributes) {
        attribList = node.attributes;
        if (attribList) {
            domElem = attribList.getNamedItem(attrName);
            if (domElem) {
                returnValue = domElem.value;
                return returnValue;
            }
        }
    }

    return returnValue;
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
/************************************************** PRIVATE FUNCTIONS *************************************************************************/