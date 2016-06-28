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
    this.ad = null;
};

/**
 * [Ad description]
 */
AdsPlayer.vast.model.Ad = function () {
    "use strict";
    
    this.id = '';
    this.inLine = null;
    this.wrapper = null;
};

/**
 * [InLine description]
 */
AdsPlayer.vast.model.Ad.InLine = function () {
    "use strict";

    this.adSystem = '';                 // [Required] Source ad server
    this.adTitle = '';                  // [Required] Title
    this.description = '';              // [Optional] Description
    this.survey = '';                   // [Optional] URI of request to survey vendor
    this.error = '';                    // [Optional] URI to request if ad does not play due to error
    this.impression = null;             // [Required] URI to track impression. 
    this.creatives = [];                // [Required] Creative elements
    this.extensions = [];               // [Optional] Any valid XML may be included in the Extensions node 
};

AdsPlayer.vast.model.Ad.InLine.prototype = {
    constructor: AdsPlayer.vast.model.Ad.InLine
};

/**
 * [Impression description]
 */
AdsPlayer.vast.model.Ad.Impression = function () {
    "use strict";
    this.uri = '';                      // [Required] URI to track Impression
    this.id = '';                       // [Optional] Identifier 
};

AdsPlayer.vast.model.Ad.Impression.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Impression
};

/**
 * [Extensions description]
 */
AdsPlayer.vast.model.Ad.Extensions = function () {
    "use strict";
    this.uri = '';                      // 
    this.other = '';                    // 
};

AdsPlayer.vast.model.Ad.Extensions.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Extensions
};

/**
 * [Creative description]
 */
AdsPlayer.vast.model.Ad.Creative = function () {
    "use strict";

    this.id = '';                       // [Optional] Identifier
    this.adId = '';                     // [Optional] Ad-ID for the creative (formerly ISCI) 
    this.sequence = 0;                  // [Optional] The preferred order in which multiple Creatives should be displayed 
    this.linear = null;                 // [Optional] Linear ad
    this.CompanionAds = [];             // [Optional] Companion ads
    this.nonLinearAds = [];             // [Optional] Non-linear ads
};

AdsPlayer.vast.model.Ad.Creative.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative
};


// Linear object
AdsPlayer.vast.model.Ad.Creative.Linear = function () {
    "use strict";
    this.duration = 0;                  // [Required] Duration in standard time format, hh:mm:ss
    this.trackingEvents = [];           // [Optional] Tracking events elements
    this.adParameters = '';             // [Optional] Data to be passed into the video ad
    this.videoClicks = null;            // [Optional] Video clicks
    this.mediaFiles = [];               // [Required] Media file elements
};

AdsPlayer.vast.model.Ad.Creative.Linear.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.Linear
};


/**
 * [TrackingEvent description]
 */
AdsPlayer.vast.model.Ad.TrackingEvent = function () {
    "use strict";
    this.uri = '';                      // [Optional] URI to track various events during playback
    this.event = '';                    // [Required] The name of the event to track for the Linear element
};

AdsPlayer.vast.model.Ad.TrackingEvent.prototype = {
    constructor: AdsPlayer.vast.model.Ad.TrackingEvent
};
 
/**
 * [VideoClicks description]
 */
AdsPlayer.vast.model.Ad.Creative.VideoClicks = function () {
    "use strict";
    this.clickThrough = '';             // [Optional] URI to open as destination page when user clicks on the video
    this.clickTracking = '';            // [Optional] URI to request for tracking purposes when user clicks on the video 
    this.customClick = '';              // [Optional] URI to request on custom events such as hotspotted video
};

AdsPlayer.vast.model.Ad.Creative.VideoClicks.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.VideoClicks
};

/**
 * [MediaFile description]
 */
AdsPlayer.vast.model.Ad.Creative.MediaFile = function () {
    "use strict";

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
};

AdsPlayer.vast.model.Ad.Creative.MediaFile.prototype = {
    constructor: AdsPlayer.vast.model.Ad.Creative.MediaFile
};


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



