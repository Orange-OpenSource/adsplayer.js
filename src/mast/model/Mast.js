
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
    EQ:  'EQ',  // equal
    NEQ: 'NEQ', // not equal
    GTR: 'GTR', // greater
    GEQ: 'GEQ', // greater or equal
    LT:  'LT',  // lower
    LEQ: 'LEQ', // lower or equal
    MOD: 'MOD'  // modulo
};

// SourceFormat
var SourceFormat = {
    VAST: 'vast',
    UIF: 'uif'
};

/**
 * [Mast description]
 */
AdsPlayer.mast.model.Mast = function () {
    "use strict";
    this.baseUrl = '';
    this.triggers = [];     // pointer to any number of Ad objects
};

/**
 * [Trigger description]
 */
AdsPlayer.mast.model.Trigger = function() {
    "use strict";

    this.id = '';
    this.description = 0;
    this.startConditions = []; // pointer to a list of start conditions to  : AdsPlayer.mast.model.Trigger.Condition
    this.endConditions = []; // pointer to a list of end conditions : AdsPlayer.mast.model.Trigger.Condition
    this.sources = []; // pointer to a list of sources : AdsPlayer.mast.model.Trigger.Source
    this.alreadyProcessed = false; // mainly in the seeked case : do not replay trigger already played
    this.vasts = [];
    this.activated = false;
};

AdsPlayer.mast.model.Trigger.prototype = {
    constructor: AdsPlayer.mast.model.Trigger
};

/**
 * [Condition description]
 */
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

/**
 * [Source description]
 */
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