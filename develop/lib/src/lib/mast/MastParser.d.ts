/**
* MAST parser. This class parses MAST file in XML format
* and construct the corresponding MAST object according to MAST data model.
*/
import * as mast from './model/Mast';
export declare class MastParser {
    constructor();
    /**
    * Parses the MAST xml file and get the triggers.
    * @param {object} xmlDom - the XML DOM to parse
    */
    parse(xmlDom: Document): mast.Mast;
    getCondition(conditionNode: any): mast.Condition;
    getSource(sourceNode: any): mast.Source;
    getTrigger(triggerNode: any): mast.Trigger;
    getTriggers(mastNode: any, mast: mast.Mast): void;
}
export default MastParser;
