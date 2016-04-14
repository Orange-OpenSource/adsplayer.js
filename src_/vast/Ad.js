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


// CreativeType
var CreativeType = {
    LINEAR: 'linear',
    NON_LINEAR_ADS: 'NonLinearAds',
    COMPANION_ADS : 'CompanionAds'
};

// MediaFileDelivery
var MediaFileDelivery = {
    STREAMING: 'streaming',
    PROGRESSIVE: 'progressive '
};

// TrackingEvent
var TrackingEvent={
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
}


//
//      Linear Ads
//

// MediaFile object
AdsPlayer.Vast.Model.MediaFile = function () {
    "use strict";

    this.id = '';                   // optional : identifier
    this.delivery = '';
    this.type = '';
    this.bitrate = 0;               // optional : bitrate of encoded video in Kbps 
    this.height = 0;
    this.width = 0;
    this.scalable=true;             // optional : whether it is acceptable to scale the image.
    this.maintainAspectRatio=true;  // optional : whether the ad must have its aspect ratio maintained when scaled
    this.apiFramework='';           // optional : defines the method to use for communication if the MediaFile is interactive. 
};

AdsPlayer.Vast.Model.MediaFile.prototype = {
    constructor: AdsPlayer.Vast.Model.MediaFile
};

// VideoClicks object
AdsPlayer.Vast.Model.VideoClicks = function () {
    "use strict";
    this.clickThrough = '';                 // URI to open as destination page when user clicks on the video
    this.clickTracking = '';                // URI to request for tracking purposes when user clicks on the video 
    this.customClick = '';                  // URIs to request on custom events such as hotspotted video  
};

AdsPlayer.Vast.Model.VideoClicks.prototype = {
    constructor: AdsPlayer.Vast.Model.VideoClicks
};

// Tracking object
AdsPlayer.Vast.Model.Tracking = function () {
    "use strict";
    this.event = '';
    this.uri = '';
};

AdsPlayer.Vast.Model.Tracking.prototype = {
    constructor: AdsPlayer.Vast.Model.Tracking
};

// Linear object
AdsPlayer.Vast.Model.Linear = function () {
    "use strict";
    this.id = '';
    this.duration = 0;
    this.trackingEvents = [];         // pointer to any number of tracking objects : AdsPlayer.Vast.Model.Tracking
    this.videoClicks = null;          // pointer video clicks object : AdsPlayer.Vast.Model.VideoClicks
    this.mediaFiles = [];             // pointer to media file object : AdsPlayer.Vast.Model.MediaFile
};

AdsPlayer.Vast.Model.Linear.prototype = {
    constructor: AdsPlayer.Vast.Model.Linear
};


//
//      Companion Ads
//

// StaticResource Object
AdsPlayer.Vast.Model.StaticResource = function () {
    "use strict";
    this.uRI = '';              // optional : URI to a static file, such as an image or SWF file 
    this.creativeType  ='';     // mime type of static resource
};

AdsPlayer.Vast.Model.StaticResource.prototype = {
    constructor: AdsPlayer.Vast.Model.StaticResource
};

// CompanionTracking object
AdsPlayer.Vast.Model.CompanionTracking = function () {
    "use strict";
    this.event = 'creativeView ';     // the creativeView should always be requested when present. For Companions creativeView is the only supported event. 
    this.uri = '';
};

AdsPlayer.Vast.Model.CompanionTracking.prototype = {
    constructor: AdsPlayer.Vast.Model.CompanionTracking
};

// Companion object
AdsPlayer.Vast.Model.Companion = function () {
    "use strict";
    this.id = '';                       // optional : identifier
    this.width = 0;                     // width pixel dimension of companion
    this.height = 0;                    // height pixel dimension of companion
    this.staticResource = null;         // optional : pointer to the static resource : AdsPlayer.Vast.Model.StaticResource
    this.iFrameResource = '';           // optional : URI source for an IFrame to display the companion element 
    this.hTMLResource = '';             // optional : HTML to display the companion element : shall be CDATA value
    this.trackingEvents = [];           // optional : pointer to any number of tracking objects : AdsPlayer.Vast.Model.CompanionTracking
    this.clickThrough = '';             // optional : URI to open as destination page when user clicks on the companion 
    this.altText = '';                  // optional : alt text to be displayed when companion is rendered in HTML environment. 
    this.adParameters = '';             // optional : data to be passed into the companion ads
};

AdsPlayer.Vast.Model.Companion.prototype = {
    constructor: AdsPlayer.Vast.Model.Companion
};


//
//      Non Linear Ads
//

// NonLinear object
AdsPlayer.Vast.Model.NonLinear = function () {
    "use strict";
    this.id = '';                       // optional : identifier
    this.width = 0;                     // width pixel dimension of non linear 
    this.height = 0;                    // height pixel dimension of non linear
    this.expandedWidth = 0;             // optional : pixel dimensions of expanding nonlinear ad when in expanded state
    this.expandedHeight  = 0;           // optional : pixel dimensions of expanding nonlinear ad when in expanded state
    this.scalable = true;               // optional : whether it is acceptable to scale the image 
    this.maintainAspectRatio = true;    // optional : whether the ad must have its aspect ratio maintained when scaled 
    this.apiFramework = '';             // optional : defines the method to use for communication with the nonlinear element
    this.staticResource = null;         // optional : pointer to the static resource : AdsPlayer.Vast.Model.StaticResource
    this.hTMLResource = '';             // optional : HTML to display the companion element : shall be CDATA value
    this.trackingEvents = [];           // optional : pointer to any number of tracking objects : AdsPlayer.Vast.Model.Tracking
    this.clickThrough = '';             // optional : URI to open as destination page when user clicks on the non-linear ad unit  
    this.adParameters = '';             // optional : data to be passed into the video ad
};

AdsPlayer.Vast.Model.NonLinear.prototype = {
    constructor: AdsPlayer.Vast.Model.NonLinear
};


//
//      Creatives
//

// Creative object
AdsPlayer.Vast.Model.Creative = function () {
    "use strict";

    this.id = '';                       // optional : identifier
    this.adId = '';                     // optional : Ad-ID for the creative (formerly ISCI) 
    this.sequence = 0;                  // optional : the preferred order in which multiple Creatives should be displayed 
    this.linear = null;                 // pointer to a unique (if any) linear Ad : AdsPlayer.Vast.Model.Linear
    this.companions = [];               // pointer to any number of companions Ads : AdsPlayer.Vast.Model.Companion
    this.nonLinears = [];               // pointer to any number of non-linear Ads : AdsPlayer.Vast.Model.NonLinear
};

AdsPlayer.Vast.Model.Creative.prototype = {
    constructor: AdsPlayer.Vast.Model.Creative
};


//
//      Ads
//

// Ad object
AdsPlayer.Vast.Model.Ad = function () {
    "use strict";

    this.system = '';
    this.title = '';
    this.description = '';
    this.impression = '';           // URI to track impression 
    this.id = '';
    this.creatives = [];            // pointer to any number of creative objects : AdsPlayer.Vast.Model.Creative
};

AdsPlayer.Vast.Model.Ad.prototype = {
    constructor: AdsPlayer.Vast.Model.Ad
};

