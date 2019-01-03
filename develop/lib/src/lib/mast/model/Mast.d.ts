import { Vast } from '../../vast/model/Vast';
/**
* @export class Mast
* @ignore
*/
export declare class Mast {
    baseUrl: string;
    triggers: Trigger[];
    constructor();
}
/**
* @export class Trigger
* @ignore
*/
export declare class Trigger {
    id: string;
    description: number;
    startConditions: Condition[];
    endConditions: Condition[];
    sources: Source[];
    alreadyProcessed: boolean;
    vasts: Vast[];
    activated: boolean;
    constructor();
}
/**
* @export class Condition
* @ignore
*/
export declare class Condition {
    type: string;
    name: string;
    value: string;
    operator: string;
    conditions: Condition[];
    constructor();
}
export declare enum CONDITION_TYPE {
    EVENT = "event",
    PROPERTY = "property"
}
export declare enum CONDITION_NAME {
    ON_ITEM_START = "OnItemStart",
    ON_ITEM_END = "OnItemEnd",
    POSITION = "Position",
    DURATION = "Duration"
}
export declare enum CONDITION_OPERATOR {
    EQ = "EQ",
    NEQ = "NEQ",
    GTR = "GTR",
    GEQ = "GEQ",
    LT = "LT",
    LEQ = "LEQ",
    MOD = "MOD"
}
/**
* @export class Source
* @ignore
*/
export declare class Source {
    uri: string;
    altReference: string;
    format: string;
    sources: any[];
    constructor();
}
export declare enum SOURCE_FORMAT {
    VAST = "vast",
    UIF = "uif"
}
