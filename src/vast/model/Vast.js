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
class Vast {
    constructor () {
        this.version = '';
        this.ads = [];
    }
}

/**
* @class Ad
* @ignore
*/
class Ad {
    constructor () {
        this.id = '';
        this.inLine = null;
        this.wrapper = null;
    }
}

/**
* @class InLine
* @ignore
*/
class InLine {
    constructor () {
        this.adSystem = '';                 // [Required] Source ad server
        this.adTitle = '';                  // [Required] Title
        this.description = '';              // [Optional] Description
        this.survey = '';                   // [Optional] URI of request to survey vendor
        this.error = '';                    // [Optional] URI to request if ad does not play due to error
        this.impressions = [];              // [Required] URIs to track impressions.
        this.creatives = [];                // [Required] Creative elements
        this.extensions = [];               // [Optional] Any valid XML may be included in the Extensions node
    }
}

/**
* @class Impression
* @ignore
*/
class Impression {
    constructor () {
        this.uri = '';                      // [Required] URI to track Impression
        this.id = '';                       // [Optional] Identifier
    }
}

/**
* @class Extensions
* @ignore
*/
class Extensions {
    constructor () {
        this.uri = '';                      //
        this.other = '';                    //
    }
}

/**
* @class Creative
* @ignore
*/
class Creative {
    constructor () {
        this.id = '';                       // [Optional] Identifier
        this.adId = '';                     // [Optional] Ad-ID for the creative (formerly ISCI)
        this.sequence = 0;                  // [Optional] The preferred order in which multiple Creatives should be displayed
        this.linear = null;                 // [Optional] Linear ad
        this.CompanionAds = [];             // [Optional] Companion ads
        this.nonLinearAds = [];             // [Optional] Non-linear ads
    }
}

// Creative types
Creative.TYPE = {
    LINEAR: 'linear',
    NON_LINEAR_ADS: 'NonLinearAds',
    COMPANION_ADS : 'CompanionAds'
};

/**
* @class Linear
* @ignore
*/
class Linear {
    constructor () {
        this.duration = 0;                  // [Required] Duration in standard time format, hh:mm:ss
        this.trackingEvents = [];           // [Optional] Tracking events elements
        this.adParameters = '';             // [Optional] Data to be passed into the video ad
        this.videoClicks = null;            // [Optional] Video clicks
        this.mediaFiles = [];               // [Required] Media file elements
    }
}

/**
* @class Companion
* @ignore
*/
class Companion {
    constructor () {
        this.id = '';                       // optional : identifier
        this.width = 0;                     // width pixel dimension of companion
        this.height = 0;                    // height pixel dimension of companion
        this.staticResource = null;         // optional : pointer to the static resource : AdsPlayer.vast.model.Ad.StaticResource
        this.iFrameResource = '';           // optional : URI source for an IFrame to display the companion element
        this.hTMLResource = '';             // optional : HTML to display the companion element : shall be CDATA value
        this.trackingEvents = [];           // optional : pointer to any number of tracking objects : AdsPlayer.vast.model.Ad.CompanionTracking
        this.clickThrough = '';             // optional : URI to open as destination page when user clicks on the companion
        this.altText = '';                  // optional : alt text to be displayed when companion is rendered in HTML environment.
        this.adParameters = '';             // optional : data to be passed into the companion ads
    }
}

//
//      Non Linear Ads
//

/**
* @class Companion
* @ignore
*/
class NonLinear {
    constructor () {
        this.id = '';                       // optional : identifier
        this.width = 0;                     // width pixel dimension of non linear
        this.height = 0;                    // height pixel dimension of non linear
        this.expandedWidth = 0;             // optional : pixel dimensions of expanding nonlinear ad when in expanded state
        this.expandedHeight  = 0;           // optional : pixel dimensions of expanding nonlinear ad when in expanded state
        this.scalable = true;               // optional : whether it is acceptable to scale the image
        this.maintainAspectRatio = true;    // optional : whether the ad must have its aspect ratio maintained when scaled
        this.apiFramework = '';             // optional : defines the method to use for communication with the nonlinear element
        this.staticResource = null;         // optional : pointer to the static resource : AdsPlayer.vast.model.Ad.StaticResource
        this.hTMLResource = '';             // optional : HTML to display the companion element : shall be CDATA value
        this.trackingEvents = [];           // optional : pointer to any number of tracking objects : AdsPlayer.vast.model.Ad.Tracking
        this.clickThrough = '';             // optional : URI to open as destination page when user clicks on the non-linear ad unit
        this.adParameters = '';             // optional : data to be passed into the video ad
    }
}

/**
* @class TrackingEvent
* @ignore
*/
class TrackingEvent {
    constructor () {
        this.uri = '';                      // [Optional] URI to track various events during playback
        this.event = '';                    // [Required] The name of the event to track for the Linear element
        this.offsetInSeconds = '';          // [Optional] Required in "Progess" event, not use with other events
        this.offsetPercent = '';            // [Optional] Required in "Progess" event, not use with other events
    }
}


/**
* [TrackingEvent description]
* @type {Object}
*/
TrackingEvent.TYPE = {
    CREATIVEVIEW:'creativeView',
    START:'start',
    MIDPOINT: 'midpoint',
    FIRSTQUARTILE: 'firstQuartile',
    THIRDQUARTILE: 'thirdQuartile',
    COMPLETE: 'complete',
    MUTE: 'mute',
    UNMUTE: 'unmute',
    PAUSE: 'pause',
    REWIND: 'rewind',
    RESUME: 'resume',
    FULLSCREEN: 'fullscreen',
    EXPAND: 'expand',
    COLLAPSE: 'collapse',
    ACCEPTINVITATION: 'acceptInvitation',
    CLOSE: 'close'
};

/**
* @class VideoClicks
* @ignore
*/
class VideoClicks {
    constructor () {
        this.clickThrough = '';             // [Optional] URI to open as destination page when user clicks on the video
        this.clickTracking = '';            // [Optional] URI to request for tracking purposes when user clicks on the video
        this.customClick = '';              // [Optional] URI to request on custom events such as hotspotted video
    }
}

/**
* @class MediaFile
* @ignore
*/
class MediaFile {
    constructor () {
        this.id = '';                       // [Optional] Identifier
        this.delivery = '';                 // [Required] Method of delivery of ad ('streaming' or 'progressive')
        this.type = '';                     // [Required] MIME type
        this.bitrate = 0;                   // [Optional] Bitrate of encoded video in Kbps
        this.width = 0;                     // [Required] Pixel dimensions of video
        this.height = 0;                    // [Required] Pixel dimensions of video
        this.scalable = true;               // [Optional] Whether it is acceptable to scale the image.
        this.maintainAspectRatio = true;    // [Optional] Whether the ad must have its aspect ratio maintained when scaled
        this.apiFramework = '';             // [Optional] Defines the method to use for communication if the MediaFile is interactive.
        this.uri = '';
    }
}

// MediaFile delivery types
MediaFile.DELIVERY = {
    STREAMING: 'streaming',
    PROGRESSIVE: 'progressive '
};

/**
* @class StaticResource
* @ignore
*/
class StaticResource {
    constructor () {
        this.uRI = '';              // optional : URI to a static file, such as an image or SWF file
        this.creativeType  ='';     // mime type of static resource
    }
}


var vast = {};

vast.Vast = Vast;
vast.Ad = Ad;
vast.InLine = InLine;
vast.Impression = Impression;
vast.Extensions = Extensions;
vast.Creative = Creative;
vast.Linear = Linear;
vast.Companion = Companion;
vast.NonLinear = NonLinear;
vast.TrackingEvent = TrackingEvent;
vast.VideoClicks = VideoClicks;
vast.MediaFile = MediaFile;
vast.StaticResource = StaticResource;

export default vast;

export { Vast, Ad, InLine, Impression, Extensions, Creative, Linear, Companion, NonLinear, TrackingEvent, VideoClicks, MediaFile, StaticResource };
