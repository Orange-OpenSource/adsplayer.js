export declare enum AdEvents {
    TRIGGER_START = "triggerStart",
    TRIGGER_END = "triggerEnd",
    AD_START = "adStart",
    AD_END = "adEnd",
    CREATIVE_START = "creativeStart",
    CREATIVE_END = "creativeEnd",
    PLAY = "play",
    PAUSE = "pause",
    CLICK = "click"
}
export declare class EventBus {
    private static instance;
    private registrations;
    private logger;
    static getInstance(): EventBus;
    constructor();
    addEventListener(type: string, listener: any): void;
    removeEventListener(type: string, listener: any): void;
    dispatchEvent(type: string, data?: object): void;
    private getListeners;
}
