/**
* The TriggerManager manages the detection of the start and end of a trigger.
* It takes as input a trigger object (as parsed from a MAST file) and tests the start and end conditions
* to detect the activation and revocation of a trigger.
*/
import * as mast from './model/Mast';
export declare class TriggerManager {
    trigger: mast.Trigger;
    constructor();
    /**
     * Initializes the TriggerManager.
     * @method init
     * @access public
     * @memberof TriggerManager#
     * @param {Trigger} trigger - the trigger to handle by this manager
     */
    init(trigger: mast.Trigger): void;
    /**
     * Returns the trigger object managed by this TriggerManager.
     * @method init
     * @access public
     * @memberof TriggerManager#
     * @return {Object} the managed trigger object
     */
    getTrigger(): mast.Trigger;
    /**
     * Evaluates the trigger start conditions.
     * @method checkStartConditions
     * @access public
     * @memberof TriggerManager#
     * @param {Number} video - the main video element
     */
    checkStartConditions(video: HTMLMediaElement): boolean;
    /**
     * Evaluates the trigger end conditions.
     * @method checkEndConditions
     * @access public
     * @memberof TriggerManager#
     * @param {Number} video - the main video element
     */
    checkEndConditions(video: HTMLMediaElement): boolean;
    private parseTime;
    private compareValues;
    private evaluateCondition;
    private evaluateConditions;
}
export default TriggerManager;
