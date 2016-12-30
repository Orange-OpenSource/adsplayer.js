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

/**
* The TriggerManager manages the detection of the start and end of a trigger.
* It takes as input a trigger object (as parsed from a MAST file) and tests the start and end conditions
* to detect the activation and revocation of a trigger.
*/

import { Condition } from './model/Mast';

class TriggerManager {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _parseTime (str) {
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
    }

    _compareValues (value1, value2, operator) {
        var res = false;

        if (value1 < 0 || value2 < 0) {
            return false;
        }

        switch (operator) {
            case Condition.OPERATOR.EQ:
                res = (value1 === value2);
                break;
            case Condition.OPERATOR.NEQ:
                res = (value1 !== value2);
                break;
            case Condition.OPERATOR.GTR:
                res = (value1 > value2);
                break;
            case Condition.OPERATOR.GEQ:
                res = (value1 >= value2);
                break;
            case Condition.OPERATOR.LT:
                res = (value1 < value2);
                break;
            case Condition.OPERATOR.LEQ:
                res = (value1 <= value2);
                break;
            case Condition.OPERATOR.MOD:
                res = ((value1 % value2) === 0);
                break;
            default:
                break;
        }
        return res;
    }

    _evaluateCondition (condition, video) {
        var res = false,
            i;

        // Check pre-roll condition for activation

        /** Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive
         *  video.currentTime === 0 is too strict, following ON_ITEM_START trigger may be ignored
         *  Detected on windows10-edge and sometimes on linux-chrome
         */
        /*if (video.currentTime === 0 && condition.type === Condition.TYPE.EVENT && condition.name === Condition.NAME.ON_ITEM_START) {*/
        if (video.currentTime < 0.5 && condition.type === Condition.TYPE.EVENT && condition.name === Condition.NAME.ON_ITEM_START) {
            res = true;
        }

        // Check mid-roll condition for activation
        if (condition.type === Condition.TYPE.PROPERTY) {
            switch (condition.name) {
                case Condition.NAME.POSITION:
                    res = this._compareValues(video.currentTime, this._parseTime(condition.value), condition.operator);
                    break;
                case Condition.NAME.DURATION:
                    res = this._compareValues(video.duration, this._parseTime(condition.value), condition.operator);
                    break;
                default:
                    break;
            }
        }

        // Check condition for revocation
        if (video.ended && condition.type === Condition.TYPE.EVENT && condition.name === Condition.NAME.ON_ITEM_END) {
            res = true;
        }

        // AND with sub-conditions
        // MAST spec. : "Child conditions are treated as an implicit AND, all children of a condition must evaluate true before a trigger will fire (or be revoked) from that condition."
        for (i = 0; i < condition.conditions.length; i++) {
            res &= this._evaluateCondition(condition.conditions[i], video);
        }

        return res;
    }

    _evaluateConditions (conditions, video) {
        var res = false,
            i;

        // Evaluate each condition
        // MAST spec. : "Multiple condition elements are treated as an implicit OR, any one of them evaluating true will fire the trigger."
        for (i = 0; i < conditions.length; i++) {
            res |=  this._evaluateCondition(conditions[i], video);
        }

        return res;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._trigger = null;
    }

    /**
     * Initializes the TriggerManager.
     * @method init
     * @access public
     * @memberof TriggerManager#
     * @param {Object} trigger - the trigger to handle by this manager
     */
    init (trigger) {
        this._trigger = trigger;
    }

    /**
     * Returns the trigger object managed by this TriggerManager.
     * @method init
     * @access public
     * @memberof TriggerManager#
     * @return {Object} the managed trigger object
     */
    getTrigger () {
        return this._trigger;
    }

    /**
     * Evaluates the trigger start conditions.
     * @method checkStartConditions
     * @access public
     * @memberof TriggerManager#
     * @param {Number} video - the main video element
     */
    checkStartConditions (video) {
        if (this._trigger.activated) {
            return false;
        }
        return this._evaluateConditions(this._trigger.startConditions, video);
    }

    /**
     * Evaluates the trigger end conditions.
     * @method checkEndConditions
     * @access public
     * @memberof TriggerManager#
     * @param {Number} video - the main video element
     */
    checkEndConditions (video) {
        return this._evaluateConditions(this._trigger.endConditions, video);
    }
}

export default TriggerManager;
