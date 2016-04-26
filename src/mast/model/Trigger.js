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

// ConditionType
var ConditionType = {
    EVENT: 'event',
    PROPERTY: 'property'

};

// ConditionName
var ConditionName = {
    ON_ITEM_START: 'OnItemStart',
    ON_ITEM_END: 'OnItemEnd',
    POSITION: 'Position',
    DURATION: 'Duration'
};

// ConditionOperator
var ConditionOperator = {
    EQ: 'EQ',
    NEQ: 'NEQ',
    GTR: 'GTR',
    GEQ: 'GEQ',
    LT: 'LT',
    LEQ: 'LEQ',
    MOD: 'MOD'
};

// SourceFormat
var SourceFormat = {
    VAST: 'vast',
    UIF: 'uif'
};


// Trigger object
AdsPlayer.mast.model.Trigger = function() {
    "use strict";

    this.id = '';
    this.description = 0;
    this.startConditions = []; // pointer to a list of start conditions to  : AdsPlayer.mast.model.Trigger.Condition
    this.endConditions = []; // pointer to a list of end conditions : AdsPlayer.mast.model.Trigger.Condition
    this.sources = []; // pointer to a list of sources : AdsPlayer.mast.model.Trigger.Source
    this.alreadyPlayed = false; // mainly in the seeked case : do not replay trigger already played
    this.media = [];
};

AdsPlayer.mast.model.Trigger.prototype = {
    constructor: AdsPlayer.mast.model.Trigger
};

// Condition object
AdsPlayer.mast.model.Trigger.Condition = function() {
    "use strict";

    this.type = '';
    this.name = '';
    this.value = '';
    this.operator = '';
    this.conditions = [];
};

AdsPlayer.mast.model.Trigger.Condition.prototype = {
    constructor: AdsPlayer.mast.model.Trigger.Condition
};

// Source object
AdsPlayer.mast.model.Trigger.Source = function() {
    "use strict";

    this.uri = '';
    this.altReference = '';
    this.format = '';
    this.sources = [];
    // this.targets = [];
};

AdsPlayer.mast.model.Trigger.Source.prototype = {
    constructor: AdsPlayer.mast.model.Trigger.Source
};