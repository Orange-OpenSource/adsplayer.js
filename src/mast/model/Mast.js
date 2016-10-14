/**
* @class Mast
* @ignore
*/
class Mast {
    constructor () {
        this.baseUrl = '';
        this.triggers = [];     // pointer to any number of Ad objects
    }
}

/**
* @class Trigger
* @ignore
*/
class Trigger {
    constructor () {
        this.id = '';
        this.description = 0;
        this.startConditions = [];      // pointer to a list of start conditions to  : AdsPlayer.mast.model.Trigger.Condition
        this.endConditions = [];        // pointer to a list of end conditions : AdsPlayer.mast.model.Trigger.Condition
        this.sources = [];              // pointer to a list of sources : AdsPlayer.mast.model.Trigger.Source
        this.alreadyProcessed = false;  // mainly in the seeked case : do not replay trigger already played
        this.vasts = [];
        this.activated = false;
    }
}

/**
* @class Condition
* @ignore
*/
class Condition {
    constructor () {
        this.type = '';
        this.name = '';
        this.value = '';
        this.operator = '';
        this.conditions = [];
    }
}

// ConditionType
Condition.TYPE = {
    EVENT: 'event',
    PROPERTY: 'property'

};

// ConditionName
Condition.NAME = {
    ON_ITEM_START: 'OnItemStart',
    ON_ITEM_END: 'OnItemEnd',
    POSITION: 'Position',
    DURATION: 'Duration'
};

// ConditionOperator
Condition.OPERATOR = {
    EQ:  'EQ',  // equal
    NEQ: 'NEQ', // not equal
    GTR: 'GTR', // greater
    GEQ: 'GEQ', // greater or equal
    LT:  'LT',  // lower
    LEQ: 'LEQ', // lower or equal
    MOD: 'MOD'  // modulo
};

/**
* @class Source
* @ignore
*/
class Source {
    constructor () {
        this.uri = '';
        this.altReference = '';
        this.format = '';
        this.sources = [];
        // this.targets = [];
    }
}

// SourceFormat
Source.FORMAT = {
    VAST: 'vast',
    UIF: 'uif'
};


var mast = {};

mast.Mast = Mast;
mast.Trigger = Trigger;
mast.Condition = Condition;
mast.Source = Source;

export default mast;
export { Mast, Trigger, Condition, Source };