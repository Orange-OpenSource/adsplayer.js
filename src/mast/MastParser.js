/**
* MAST parser. This class parses MAST file in XML format
* and construct the corresponding MAST object according to MAST data model.
*/

import mast from './model/Mast';
import xmldom from '../utils/xmldom';

class MastParser {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _getCondition (conditionNode) {
        let condition = new mast.Condition(),
            conditionNodes;

        condition.type = conditionNode.getAttribute('type');
        condition.name = conditionNode.getAttribute('name');
        condition.value = conditionNode.getAttribute('value');
        condition.operator = conditionNode.getAttribute('operator');
        conditionNodes = conditionNode.getElementsByTagName('condition');
        for (let i = 0; i < conditionNodes.length; i++) {
            condition.conditions.push(this._getCondition(conditionNodes[i]));
        }

        return condition;
    }

    _getSource (sourceNode) {
        let source = new mast.Source(),
            sourceNodes;

        source.uri = sourceNode.getAttribute('uri');
        source.altReference = sourceNode.getAttribute('altReference');
        source.format = sourceNode.getAttribute('format');
        sourceNodes = sourceNode.getElementsByTagName('source');
        for (let i = 0; i < sourceNodes.length; i++) {
            source.sources.push(this._getSource(sourceNodes[i]));
        }

        return source;
    }

    _getTrigger (triggerNode) {
        let trigger = new mast.Trigger(),
            startConditionNodes = xmldom.getSubElements(triggerNode, 'startConditions', 'condition'),
            endConditionNodes = xmldom.getSubElements(triggerNode, 'endConditions', 'condition'),
            sourceNodes = xmldom.getSubElements(triggerNode, 'sources', 'source'),
            i;

        trigger.id = triggerNode.getAttribute('id');
        trigger.description = triggerNode.getAttribute('description');

        for (i = 0; i < startConditionNodes.length; i++) {
            trigger.startConditions.push(this._getCondition(startConditionNodes[i]));
        }

        for (i = 0; i < endConditionNodes.length; i++) {
            trigger.endConditions.push(this._getCondition(endConditionNodes[i]));
        }

        for (i = 0; i < sourceNodes.length; i++) {
            trigger.sources.push(this._getSource(sourceNodes[i]));
        }

        return trigger;
    }

    _getTriggers (mastNode, mast) {
        let triggerNodes = xmldom.getSubElements(mastNode, 'triggers', 'trigger');

        for (let i = 0; i < triggerNodes.length; i++) {
            mast.triggers.push(this._getTrigger(triggerNodes[i]));
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
    }

    /**
    * Parses the MAST xml file and get the triggers.
    * @param {object} xmlDom - the XML DOM to parse
    */
    parse (xmlDom) {
        let mast_ = new mast.Mast(),
            mastNode = xmldom.getElement(xmlDom, 'MAST');

        if (mastNode === null) {
            return mast_;
        }

        this._getTriggers(mastNode, mast_);

        return mast_;
    }
}


export default MastParser;