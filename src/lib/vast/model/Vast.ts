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
* @class Vast
* @ignore
*/
export class Vast {
    version: string = '';
    ads: Ad[] = [];
    baseUrl: string = '';
}

/**
* @class Ad
* @ignore
*/
export class Ad {
    id: string = '';        // [Optional] an ad server-defined string for the ad
    sequence: number = 0;   // [Optional] the sequence in which an ad should play
    inLine: InLine = null;
    wrapper = null;
}

/**
* @class InLine
* @ignore
*/
export class InLine {
    adSystem: string = '';          // [Required] Source ad server
    adTitle: string = '';           // [Required] Title
    description: string = '';       // [Optional] Description
    survey: string = '';            // [Optional] URI of request to survey vendor
    error: string = '';             // [Optional] URI to request if ad does not play due to error
    impressions: Impression[] = []; // [Required] URIs to track impressions.
    creatives: Creative[] = [];     // [Required] Creative elements
    extensions: Extensions[] = [];  // [Optional] Any valid XML may be included in the Extensions node
}

/**
* @class Impression
* @ignore
*/
export class Impression {
    uri: string = '';   // [Required] URI to track Impression
    id: string = '';    // [Optional] Identifier
}

/**
* @class Extensions
* @ignore
*/
export class Extensions {
    uri: string = '';   //
    other: string = ''; //
}

/**
* @class Creative
* @ignore
*/
export class Creative {
    id: string = '';                // [Optional] Identifier
    adId: string = '';              // [Optional] Ad-ID for the creative (formerly ISCI)
    sequence: number = 0;           // [Optional] The preferred order in which multiple Creatives should be displayed
    linear: Linear = null;          // [Optional] Linear ad
    CompanionAds: Companion[] = []; // [Optional] Companion ads
    nonLinearAds: NonLinear[] = []; // [Optional] Non-linear ads
}

// Creative types
export enum CREATIVE_TYPE {
    LINEAR = 'linear',
    NON_LINEAR_ADS = 'NonLinearAds',
    COMPANION_ADS = 'CompanionAds'
};

/**
* @class Linear
* @ignore
*/
export class Linear {
    duration: string = '';                  // [Required] Duration in standard time format, hh:mm:ss
    trackingEvents: TrackingEvent[] = [];   // [Optional] Tracking events elements
    adParameters: string = '';              // [Optional] Data to be passed into the video ad
    videoClicks: VideoClicks = null;        // [Optional] Video clicks
    mediaFiles = [];                        // [Required] Media file elements
}

/**
* @class Companion
* @ignore
*/
export class Companion {
    id: string = '';                        // optional : identifier
    width: number = 0;                      // width pixel dimension of companion
    height: number = 0;                     // height pixel dimension of companion
    staticResource: StaticResource = null;  // optional : pointer to the static resource : AdsPlayer.vast.model.Ad.StaticResource
    iFrameResource: string = '';            // optional : URI source for an IFrame to display the companion element
    hTMLResource: string = '';              // optional : HTML to display the companion element : shall be CDATA value
    trackingEvents: TrackingEvent[] = [];   // optional : pointer to any number of tracking objects : AdsPlayer.vast.model.Ad.CompanionTracking
    clickThrough: string = '';              // optional : URI to open as destination page when user clicks on the companion
    altText: string = '';                   // optional : alt text to be displayed when companion is rendered in HTML environment.
    adParameters: string = '';              // optional : data to be passed into the companion ads
}

//
//      Non Linear Ads
//

/**
* @class Companion
* @ignore
*/
export class NonLinear {
    id: string = '';                        // optional : identifier
    width: number = 0;                      // width pixel dimension of non linear
    height: number = 0;                     // height pixel dimension of non linear
    expandedWidth: number = 0;              // optional : pixel dimensions of expanding nonlinear ad when in expanded state
    expandedHeight : number = 0;            // optional : pixel dimensions of expanding nonlinear ad when in expanded state
    scalable: boolean = true;               // optional : whether it is acceptable to scale the image
    maintainAspectRatio: boolean = true;    // optional : whether the ad must have its aspect ratio maintained when scaled
    apiFramework: string = '';              // optional : defines the method to use for communication with the nonlinear element
    staticResource: StaticResource = null;  // optional : pointer to the static resource : AdsPlayer.vast.model.Ad.StaticResource
    hTMLResource: string = '';              // optional : HTML to display the companion element : shall be CDATA value
    trackingEvents: TrackingEvent[] = [];   // optional : pointer to any number of tracking objects : AdsPlayer.vast.model.Ad.Tracking
    clickThrough: string = '';              // optional : URI to open as destination page when user clicks on the non-linear ad unit
    adParameters: string = '';              // optional : data to be passed into the video ad
}

/**
* @class TrackingEvent
* @ignore
*/
export class TrackingEvent {
    uri: string = '';               // [Optional] URI to track various events during playback
    event: string = '';             // [Required] The name of the event to track for the Linear element
    offsetInSeconds: number = 0;    // [Optional] Required in 'Progess' event, not use with other events
    offsetPercent: number = 0;      // [Optional] Required in 'Progess' event, not use with other events
    condition: Function;            // Used by TrackingEventsManager
    oneShot: boolean = true;        // Used by TrackingEventsManager
    completed: boolean = false;      // Used by TrackingEventsManager
}


/**
* [TrackingEvent description]
* @type {Object}
*/
export enum TRACKINGEVENT_TYPE {
    CREATIVEVIEW = 'creativeView',
    START = 'start',
    MIDPOINT = 'midpoint',
    FIRSTQUARTILE = 'firstQuartile',
    THIRDQUARTILE = 'thirdQuartile',
    COMPLETE = 'complete',
    MUTE = 'mute',
    UNMUTE = 'unmute',
    PAUSE = 'pause',
    REWIND = 'rewind',
    RESUME = 'resume',
    FULLSCREEN = 'fullscreen',
    EXPAND = 'expand',
    COLLAPSE = 'collapse',
    ACCEPTINVITATION = 'acceptInvitation',
    CLOSE = 'close'
};

/**
* @class VideoClicks
* @ignore
*/
export class VideoClicks {
    clickThrough: string = '';          // [Optional] URI to open as destination page when user clicks on the video
    clickTracking: string = '';         // [Optional] URI to request for tracking purposes when user clicks on the video
    customClick: string = '';           // [Optional] URI to request on custom events such as hotspotted video
}

/**
* @class MediaFile
* @ignore
*/
export class MediaFile {
    id: string = '';                    // [Optional] Identifier
    delivery: string = '';              // [Required] Method of delivery of ad ('streaming' or 'progressive')
    type: string = '';                  // [Required] MIME type
    bitrate: number = 0;                // [Optional] Bitrate of encoded video in Kbps
    width: number = 0;                  // [Required] Pixel dimensions of video
    height: number = 0;                 // [Required] Pixel dimensions of video
    scalable: boolean = true;           // [Optional] Whether it is acceptable to scale the image.
    maintainAspectRatio: boolean = true;// [Optional] Whether the ad must have its aspect ratio maintained when scaled
    apiFramework: string = '';          // [Optional] Defines the method to use for communication if the MediaFile is interactive.
    uri: string = '';
}

// MediaFile delivery types
export enum MEIAFILE_DELIVERY {
    STREAMING = 'streaming',
    PROGRESSIVE = 'progressive '
};

/**
* @class StaticResource
* @ignore
*/
export class StaticResource {
    uRI: string = '';   // optional : URI to a static file, such as an image or SWF file
    creativeType  ='';  // mime type of static resource
}

