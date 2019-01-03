/*
* The copyright in this software module is being made available under the BSD License, included
* below. This software module may be subject to other third party and/or contributor rights,
* including patent rights, and no such rights are granted under this license.
*
* Copyright (c) 2016, Orange
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted
* provided that the following conditions are met:
* - Redistributions of source code must retain the above copyright notice, this list of conditions
*   and the following disclaimer.
* - Redistributions in binary form must reproduce the above copyright notice, this list of
*   conditions and the following disclaimer in the documentation and/or other materials provided
*   with the distribution.
* - Neither the name of Orange nor the names of its contributors may be used to endorse or promote
*   products derived from this software module without specific prior written permission.
*
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
* IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
* FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER O
* CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
* WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
* WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import { Vast } from '../../vast/model/Vast';

/**
* @export class Mast
* @ignore
*/
export class Mast {
    baseUrl: string = ''; // pointer to any number of Ad objects
    triggers: Trigger[] = [];
    constructor () {
    }
}

/**
* @export class Trigger
* @ignore
*/
export class Trigger {
    id:string = '';
    description: number = 0;
    startConditions: Condition[] = [];      // pointer to a list of start conditions to  : AdsPlayer.mast.model.Trigger.Condition
    endConditions: Condition[] = [];        // pointer to a list of end conditions : AdsPlayer.mast.model.Trigger.Condition
    sources: Source[] = [];              // pointer to a list of sources : AdsPlayer.mast.model.Trigger.Source
    alreadyProcessed: boolean = false;  // mainly in the seeked case : do not replay trigger already played
    vasts: Vast[] = [];
    activated: boolean = false;
    constructor () {
    }
}

/**
* @export class Condition
* @ignore
*/
export class Condition {
    type: string = '';
    name: string = '';
    value: string = '';
    operator: string = '';
    conditions: Condition[] = [];
constructor () {
    }
}

// ConditionType
export enum CONDITION_TYPE {
    EVENT = 'event',
    PROPERTY = 'property'

};

// ConditionName
export enum CONDITION_NAME {
    ON_ITEM_START = 'OnItemStart',
    ON_ITEM_END = 'OnItemEnd',
    POSITION = 'Position',
    DURATION = 'Duration'
};

// ConditionOperator
export enum CONDITION_OPERATOR {
    EQ = 'EQ',  // equal
    NEQ = 'NEQ', // not equal
    GTR = 'GTR', // greater
    GEQ = 'GEQ', // greater or equal
    LT = 'LT',  // lower
    LEQ = 'LEQ', // lower or equal
    MOD = 'MOD'  // modulo
};

/**
* @export class Source
* @ignore
*/
export class Source {
    uri: string = '';
    altReference: string = '';
    format: string = '';
    sources: any[] = [];
    // targets = [];
    constructor () {
    }
}

// SourceFormat
export enum SOURCE_FORMAT {
    VAST = 'vast',
    UIF = 'uif'
};
