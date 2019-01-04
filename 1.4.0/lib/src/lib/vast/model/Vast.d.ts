/**
* @class Vast
* @ignore
*/
export declare class Vast {
    version: string;
    ads: Ad[];
    baseUrl: string;
}
/**
* @class Ad
* @ignore
*/
export declare class Ad {
    id: string;
    sequence: number;
    inLine: InLine;
    wrapper: any;
}
/**
* @class InLine
* @ignore
*/
export declare class InLine {
    adSystem: string;
    adTitle: string;
    description: string;
    survey: string;
    error: string;
    impressions: Impression[];
    creatives: Creative[];
    extensions: Extensions[];
}
/**
* @class Impression
* @ignore
*/
export declare class Impression {
    uri: string;
    id: string;
}
/**
* @class Extensions
* @ignore
*/
export declare class Extensions {
    uri: string;
    other: string;
}
/**
* @class Creative
* @ignore
*/
export declare class Creative {
    id: string;
    adId: string;
    sequence: number;
    linear: Linear;
    CompanionAds: Companion[];
    nonLinearAds: NonLinear[];
}
export declare enum CREATIVE_TYPE {
    LINEAR = "linear",
    NON_LINEAR_ADS = "NonLinearAds",
    COMPANION_ADS = "CompanionAds"
}
/**
* @class Linear
* @ignore
*/
export declare class Linear {
    duration: string;
    trackingEvents: TrackingEvent[];
    adParameters: string;
    videoClicks: VideoClicks;
    mediaFiles: any[];
}
/**
* @class Companion
* @ignore
*/
export declare class Companion {
    id: string;
    width: number;
    height: number;
    staticResource: StaticResource;
    iFrameResource: string;
    hTMLResource: string;
    trackingEvents: TrackingEvent[];
    clickThrough: string;
    altText: string;
    adParameters: string;
}
/**
* @class Companion
* @ignore
*/
export declare class NonLinear {
    id: string;
    width: number;
    height: number;
    expandedWidth: number;
    expandedHeight: number;
    scalable: boolean;
    maintainAspectRatio: boolean;
    apiFramework: string;
    staticResource: StaticResource;
    hTMLResource: string;
    trackingEvents: TrackingEvent[];
    clickThrough: string;
    adParameters: string;
}
/**
* @class TrackingEvent
* @ignore
*/
export declare class TrackingEvent {
    uri: string;
    event: string;
    offsetInSeconds: number;
    offsetPercent: number;
    condition: Function;
    oneShot: boolean;
    completed: boolean;
}
/**
* [TrackingEvent description]
* @type {Object}
*/
export declare enum TRACKINGEVENT_TYPE {
    CREATIVEVIEW = "creativeView",
    START = "start",
    MIDPOINT = "midpoint",
    FIRSTQUARTILE = "firstQuartile",
    THIRDQUARTILE = "thirdQuartile",
    COMPLETE = "complete",
    MUTE = "mute",
    UNMUTE = "unmute",
    PAUSE = "pause",
    REWIND = "rewind",
    RESUME = "resume",
    FULLSCREEN = "fullscreen",
    EXPAND = "expand",
    COLLAPSE = "collapse",
    ACCEPTINVITATION = "acceptInvitation",
    CLOSE = "close"
}
/**
* @class VideoClicks
* @ignore
*/
export declare class VideoClicks {
    clickThrough: string;
    clickTracking: string;
    customClick: string;
}
/**
* @class MediaFile
* @ignore
*/
export declare class MediaFile {
    id: string;
    delivery: string;
    type: string;
    bitrate: number;
    width: number;
    height: number;
    scalable: boolean;
    maintainAspectRatio: boolean;
    apiFramework: string;
    uri: string;
}
export declare enum MEIAFILE_DELIVERY {
    STREAMING = "streaming",
    PROGRESSIVE = "progressive "
}
/**
* @class StaticResource
* @ignore
*/
export declare class StaticResource {
    uRI: string;
    creativeType: string;
}
