/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 * 
 * Copyright (c) 2016, Orange
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * [CreativeType description]
 * @type {Object}
 */
var CreativeType = {
    LINEAR: 'linear',
    NON_LINEAR_ADS: 'NonLinearAds',
    COMPANION_ADS : 'CompanionAds'
};

/**
 * [MediaFileDelivery description]
 * @type {Object}
 */
var MediaFileDelivery = {
    STREAMING: 'streaming',
    PROGRESSIVE: 'progressive '
};

/**
 * [TrackingEvent description]
 * @type {Object}
 */
var TrackingEvent = {
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
 * [vast description]
 * @return {[type]} [description]
 */
AdsPlayer.vast.model.Vast = function () {
    "use strict";

    this.version = '';
    this.ads = [];     // pointer to any number of Ad objects
    this.model = {};

};

/**
 * [model description]
 * @return {[type]} [description]
 */
/*AdsPlayer.vast.model = function () {
    "use strict";
    this.Ad = {};

};*/

/**
 * [Ad description]
 */
AdsPlayer.vast.model.Ad = function () {
    "use strict";
    
    this.id = '';
    this.inLine = null;       // pointer to one InLine object
    this.wrapper = null;
};

/**
 * [InLine description]
 */
AdsPlayer.vast.model.Ad.InLine = function () {
    "use strict";

    this.adSystem = '';              // Ad server (required)
    this.adTitle = '';               // Ad Title
    this.description = '';           // ad Description (optional)
    this.survey= '';                 // URL of request to survey vendor
    this.error = '';                 // URL to request if ad does not play due to error
    this.impression = [];            // URI to track impression. 
    this.creatives = [];             // pointer to any number of creative objects : AdsPlayer.vast.model.Ad.Creative
    this.extentions = [];            // Any valid XML may be included in the Extensions node 
};

AdsPlayer.vast.model.Ad.InLine.prototype = {
    constructor: AdsPlayer.vast.model.Ad.InLine
};

/**
 * [Impressions description]
 */
AdsPlayer.vast.model.Ad.Impressions = function () {
    "use strict";
    this.uri = '';                 // 
    this.id = '';                  // optional 
};

AdsPlayer.vast.model.Ad.Impressions.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Impressions
};

/**
 * [Extensions description]
 */
AdsPlayer.vast.model.Ad.Extensions = function () {
    "use strict";
    this.uri = '';                 // 
    this.other = '';                  // optional 
};

AdsPlayer.vast.model.Ad.Extensions.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Extensions
};

/**
 * [Creative description]
 */
AdsPlayer.vast.model.Ad.Creative = function () {
    "use strict";

    this.id = '';                       // optional : identifier
    this.adId = '';                     // optional : Ad-ID for the creative (formerly ISCI) 
    this.sequence = 0;                  // optional : the preferred order in which multiple Creatives should be displayed 
    this.linear = null;                 // pointer to a unique (if any) linear Ad : AdsPlayer.vast.model.Ad.Creative
    this.CompanionAds = [];             // pointer to any number of companions Ads : AdsPlayer.vast.model.Ad.Creative.CompanionAds
    this.nonLinearAds = [];             // pointer to any number of non-linear Ads : AdsPlayer.vast.model.Ad.Creative.NonLinearAds
};

AdsPlayer.vast.model.Ad.Creative.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative
};


// Linear object
AdsPlayer.vast.model.Ad.Creative.Linear = function () {
    "use strict";
    this.duration = 0;                // Duration in standard time format, hh:mm:ss
    this.trackingEvents = [];         // pointer to any number of tracking objects : AdsPlayer.vast.model.Ad.Creative.Tracking
    this.adParameters = '';           // Data to be passed into the video ad
    this.videoClicks = null;          // pointer video clicks object : AdsPlayer.vast.model.Ad.Creative.VideoClicks
    this.mediaFiles = [];             // pointer to media file object : AdsPlayer.vast.model.Ad.Creative.MediaFile
};

AdsPlayer.vast.model.Ad.Creative.Linear.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.Linear
};


/**
 * [TrackingEvent description]
 */
AdsPlayer.vast.model.Ad.TrackingEvent = function () {
    "use strict";
    this.event = '';   // 'creativeView'
    this.uri = '';
};

AdsPlayer.vast.model.Ad.TrackingEvent.prototype = {
    constructor: AdsPlayer.vast.model.Ad.TrackingEvent
};

/**
 * [MediaFile description]
 */
AdsPlayer.vast.model.Ad.Creative.MediaFile = function () {
    "use strict";

    this.id = '';                   // optional : identifier
    this.delivery = '';             // required: Method of delivery of ad
    this.type = '';                 // required : MIME type
    this.bitrate = 0;               // optional : bitrate of encoded video in Kbps 
    this.width = 0;                 // requierd : Pixel dimensions of video
    this.height = 0;                // requierd : Pixel dimensions of video
    this.scalable = true;             // optional : whether it is acceptable to scale the image.
    this.maintainAspectRatio = true;  // optional : whether the ad must have its aspect ratio maintained when scaled
    this.apiFramework = '';           // optional : defines the method to use for communication if the MediaFile is interactive. 
    this.uri = '';
};

AdsPlayer.vast.model.Ad.Creative.MediaFile.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.MediaFile
};
 
/**
 * [VideoClicks description]
 */
AdsPlayer.vast.model.Ad.Creative.VideoClicks = function () {
    "use strict";
    this.clickThrough = null;                 // URI to open as destination page when user clicks on the video
    this.clickTracking = [];                // URIs to request for tracking purposes when user clicks on the video 
    this.customClick = [];                  // URIs to request on custom events such as hotspotted video  
};

AdsPlayer.vast.model.Ad.Creative.VideoClicks.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.VideoClicks
};

/**
 * [ClickThrough description]
 */
AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickThrough = function () {
    "use strict";
    this.uri = '';                 // 
    this.id = '';                  // optional 
};

AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickThrough.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickThrough
};

/**
 * [ClickTracking description]
 */
AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickTracking = function () {
    "use strict";
    this.uri = '';                 // URL to request for tracking purposes when user clicks on the video
    this.id = '';                  // optional 
};

AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickTracking.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickTracking
};

/**
 * [CustomClick description]
 */
AdsPlayer.vast.model.Ad.Creative.VideoClicks.CustomClick = function () {
    "use strict";
    this.uri = '';                 // 
    this.id = '';                  // optional 
};

AdsPlayer.vast.model.Ad.Creative.VideoClicks.CustomClick.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.VideoClicks.CustomClick
};


//---------------------------ici -----------------------------
/**
 * [StaticResource description]
 */
AdsPlayer.vast.model.Ad.StaticResource = function () {
    "use strict";
    this.uRI = '';              // optional : URI to a static file, such as an image or SWF file 
    this.creativeType  ='';     // mime type of static resource
};

AdsPlayer.vast.model.Ad.StaticResource.prototype = {
    constructor: AdsPlayer.vast.model.Ad.StaticResource
};

/**
 * [Companion description]
 */
AdsPlayer.vast.model.Ad.Companion = function () {
    "use strict";
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
};

AdsPlayer.vast.model.Ad.Companion.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Companion
};


//
//      Non Linear Ads
//

/**
 * [NonLinear description]
 */
AdsPlayer.vast.model.Ad.NonLinear = function () {
    "use strict";
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
};

AdsPlayer.vast.model.Ad.NonLinear.prototype = {
    constructor: AdsPlayer.vast.model.Ad.NonLinear
};


//
//      Creatives
//


