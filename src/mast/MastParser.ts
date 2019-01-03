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
* MAST parser. This class parses MAST file in XML format
* and construct the corresponding MAST object according to MAST data model.
*/

import * as mast from './model/Mast';
import { XmlDom } from '../utils/xmldom';


export class MastParser {

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
    }

    /**
    * Parses the MAST xml file and get the triggers.
    * @param {object} xmlDom - the XML DOM to parse
    */
    parse (xmlDom: Document) {
        let _mast: mast.Mast = new mast.Mast(),
            mastNode = XmlDom.getElement(xmlDom, 'MAST');

        if (mastNode === null) {
            return _mast;
        }

        this.getTriggers(mastNode, _mast);

        return _mast;
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------


    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------    


    getCondition (conditionNode): mast.Condition {
        let condition: mast.Condition = new mast.Condition(),
            conditionNodes;

        condition.type = conditionNode.getAttribute('type');
        condition.name = conditionNode.getAttribute('name');
        condition.value = conditionNode.getAttribute('value');
        condition.operator = conditionNode.getAttribute('operator');
        conditionNodes = conditionNode.getElementsByTagName('condition');
        for (let i = 0; i < conditionNodes.length; i++) {
            condition.conditions.push(this.getCondition(conditionNodes[i]));
        }

        return condition;
    }

    getSource (sourceNode): mast.Source {
        let source: mast.Source = new mast.Source(),
            sourceNodes;

        source.uri = sourceNode.getAttribute('uri');
        source.altReference = sourceNode.getAttribute('altReference');
        source.format = sourceNode.getAttribute('format');
        sourceNodes = sourceNode.getElementsByTagName('source');
        for (let i = 0; i < sourceNodes.length; i++) {
            source.sources.push(this.getSource(sourceNodes[i]));
        }

        return source;
    }

    getTrigger (triggerNode): mast.Trigger {
        let trigger: mast.Trigger = new mast.Trigger(),
            startConditionNodes = XmlDom.getSubElements(triggerNode, 'startConditions', 'condition'),
            endConditionNodes = XmlDom.getSubElements(triggerNode, 'endConditions', 'condition'),
            sourceNodes = XmlDom.getSubElements(triggerNode, 'sources', 'source');

        trigger.id = triggerNode.getAttribute('id');
        trigger.description = triggerNode.getAttribute('description');

        for (let i = 0; i < startConditionNodes.length; i++) {
            trigger.startConditions.push(this.getCondition(startConditionNodes[i]));
        }

        for (let i = 0; i < endConditionNodes.length; i++) {
            trigger.endConditions.push(this.getCondition(endConditionNodes[i]));
        }

        for (let i = 0; i < sourceNodes.length; i++) {
            trigger.sources.push(this.getSource(sourceNodes[i]));
        }

        return trigger;
    }

    getTriggers (mastNode, mast: mast.Mast) {
        let triggerNodes = XmlDom.getSubElements(mastNode, 'triggers', 'trigger');

        for (let i = 0; i < triggerNodes.length; i++) {
            mast.triggers.push(this.getTrigger(triggerNodes[i]));
        }
    }

    // #endregion PRIVATE FUNCTIONS
    // --------------------------------------------------

}


export default MastParser;