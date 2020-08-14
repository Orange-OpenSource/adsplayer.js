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

import * as mast from './model/Mast';
import { Utils } from '../utils/utils';


export class TriggerManager {

    // #region MEMBERS
    // --------------------------------------------------

    trigger: mast.Trigger;

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
        this.trigger = null;
    }

    /**
     * Initializes the TriggerManager.
     * @method init
     * @access public
     * @memberof TriggerManager#
     * @param {Trigger} trigger - the trigger to handle by this manager
     */
    init (trigger: mast.Trigger) {
        this.trigger = trigger;
    }

    /**
     * Returns the trigger object managed by this TriggerManager.
     * @method init
     * @access public
     * @memberof TriggerManager#
     * @return {Object} the managed trigger object
     */
    getTrigger (): mast.Trigger {
        return this.trigger;
    }

    /**
     * Evaluates the trigger start conditions.
     * @method checkStartConditions
     * @access public
     * @memberof TriggerManager#
     * @param {Number} video - the main video element
     */
    checkStartConditions (video: HTMLMediaElement) {
        if (this.trigger.activated) {
            return false;
        }

        if (this.trigger.sources.length === 0) {
            // no ads sources to play, do not activate this trigger
            return false;
        }

        return this.evaluateConditions(this.trigger.startConditions, video);
    }

    /**
     * Evaluates the trigger end conditions.
     * @method checkEndConditions
     * @access public
     * @memberof TriggerManager#
     * @param {Number} video - the main video element
     */
    checkEndConditions (video: HTMLMediaElement) {
        return this.evaluateConditions(this.trigger.endConditions, video);
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private compareValues (value1: number, value2: number, operator: string): boolean {

        if (value1 < 0 || value2 < 0) {
            return false;
        }

        let res: boolean = false;
        switch (operator) {
            case mast.CONDITION_OPERATOR.EQ:
                res = (value1 === value2);
                break;
            case mast.CONDITION_OPERATOR.NEQ:
                res = (value1 !== value2);
                break;
            case mast.CONDITION_OPERATOR.GTR:
                res = (value1 > value2);
                break;
            case mast.CONDITION_OPERATOR.GEQ:
                res = (value1 >= value2);
                break;
            case mast.CONDITION_OPERATOR.LT:
                res = (value1 < value2);
                break;
            case mast.CONDITION_OPERATOR.LEQ:
                res = (value1 <= value2);
                break;
            case mast.CONDITION_OPERATOR.MOD:
                res = ((value1 % value2) === 0);
                break;
            default:
                break;
        }
        return res;
    }

    private evaluateCondition (condition: mast.Condition, video: HTMLMediaElement): boolean {
        let res: boolean = false;

        // Check pre-roll condition for activation
        if (video.currentTime === 0 && condition.type === mast.CONDITION_TYPE.EVENT && condition.name === mast.CONDITION_NAME.ON_ITEM_START) {
            res = true;
        }

        // Check mid-roll condition for activation
        if (condition.type === mast.CONDITION_TYPE.PROPERTY) {
            switch (condition.name) {
                case mast.CONDITION_NAME.POSITION:
                    res = this.compareValues(video.currentTime, Utils.parseTime(condition.value), condition.operator);
                    break;
                case mast.CONDITION_NAME.DURATION:
                    res = this.compareValues(video.duration, Utils.parseTime(condition.value), condition.operator);
                    break;
                default:
                    break;
            }
        }

        // Check condition for revocation
        if (video.ended && condition.type === mast.CONDITION_TYPE.EVENT && condition.name === mast.CONDITION_NAME.ON_ITEM_END) {
            res = true;
        }

        // AND with sub-conditions
        // MAST spec. : "Child conditions are treated as an implicit AND, all children of a condition must evaluate true before a trigger will fire (or be revoked) from that condition."
        for (let i = 0; i < condition.conditions.length; i++) {
            res = res && this.evaluateCondition(condition.conditions[i], video);
        }

        return res;
    }

    private evaluateConditions (conditions, video: HTMLMediaElement): boolean {
        let res: boolean = false;

        // Evaluate each condition
        // MAST spec. : "Multiple condition elements are treated as an implicit OR, any one of them evaluating true will fire the trigger."
        for (let i = 0; i < conditions.length; i++) {
            res = res || this.evaluateCondition(conditions[i], video);
        }

        return res;
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

}

export default TriggerManager;
