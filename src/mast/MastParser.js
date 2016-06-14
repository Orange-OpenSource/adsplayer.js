

AdsPlayer.mast.MastParser = function() {
    "use strict";
    var _parser = new AdsPlayer.utils.DOMParser(),
        _debug = AdsPlayer.Debug.getInstance();


    var _getCondition = function(conditionNode) {
            var condition = new AdsPlayer.mast.model.Trigger.Condition(),
                conditionNodes,
                i;

            condition.type = conditionNode.getAttribute('type');
            condition.name = conditionNode.getAttribute('name');
            condition.value = conditionNode.getAttribute('value');
            condition.operator = conditionNode.getAttribute('operator');
            conditionNodes = conditionNode.getElementsByTagName('condition');
            for (i = 0; i < conditionNodes.length; i++) {
                trigger.conditions.push(_getCondition(conditionNodes[i]));
            }

            return condition;
        },

        _getSource = function(sourceNode) {
            var source = new AdsPlayer.mast.model.Trigger.Source(),
                sourceNodes,
                i;

            source.uri = sourceNode.getAttribute('uri');
            source.altReference = sourceNode.getAttribute('altReference');
            source.format = sourceNode.getAttribute('format');
            sourceNodes = sourceNode.getElementsByTagName('source');
            for (i = 0; i < sourceNodes.length; i++) {
                source.sources.push(_getSource(sourceNodes[i]));
            }

            return source;
        },

        _getTrigger = function(triggerNode) {
            var trigger = new AdsPlayer.mast.model.Trigger(),
                startConditionNodes = xmldom.getSubElements(triggerNode, 'startConditions', 'condition'),
                endConditionNodes = xmldom.getSubElements(triggerNode, 'endConditions', 'condition'),
                sourceNodes = xmldom.getSubElements(triggerNode, 'sources', 'source'),
                condition,
                i;

            trigger.id = triggerNode.getAttribute('id');
            trigger.description = triggerNode.getAttribute('description');

            for (i = 0; i < startConditionNodes.length; i++) {
                trigger.startConditions.push(_getCondition(startConditionNodes[i]));
            }

            for (i = 0; i < endConditionNodes.length; i++) {
                trigger.endConditions.push(_getCondition(endConditionNodes[i]));
            }

            for (i = 0; i < sourceNodes.length; i++) {
                trigger.sources.push(_getSource(sourceNodes[i]));
            }

            return trigger;
        },

        _getTriggers = function(mastNode, mast) {
            var triggerNodes = xmldom.getSubElements(mastNode, 'triggers', 'trigger'),
                i;

            for (i = 0; i < triggerNodes.length; i++) {
                mast.triggers.push(_getTrigger(triggerNodes[i]));
            }
        };

    return {

        /**
        * Parses the MAST xml file and get the triggers.
        * @param {object} xmlDom - the XML DOM to parse
        */
        parse: function(xmlDom) {
            var mast = new AdsPlayer.mast.model.Mast(),
                mastNode = xmldom.getElement(xmlDom, 'MAST');

            if (mastNode === null) {
                return mast;
            }

            _getTriggers(mastNode, mast);

            return mast;
        }
    };
};

AdsPlayer.mast.MastParser.prototype = {
    constructor: AdsPlayer.mast.MastParser
};