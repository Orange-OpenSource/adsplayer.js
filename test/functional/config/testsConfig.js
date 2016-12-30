define(function(require) {

    var _createInstance = function() {
        return {
            // Common tests suite configuration fields
            testPageUrl : "http://localhost/csadsplugin/samples/testsPlayer",                                           // url of the html page under test
            streamUrl   : "http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest",// url of the main stream
                                                                                                                        // take care using one with video.currentTime = 0 at the beginning
                                                                                                                        // for the pre-roll tests
            tests : {

                // Test suite multipleAds specific configuration fields
                multipleAds: {
                    adPod: {
                        mastUrl: "../ads/xml/mast/preroll-vast30-adPods.xml",
                        ads: [  {media: "../ads/media/vo_ad_2.mp4", duration : 6000},
                                {media: "../ads/media/vo_ad_4.mp4", duration : 4000}]
                    },
                    doubleAdsInVast: {
                        mastUrl: "../ads/xml/mast/preroll-double-vast2.xml",
                        ads: [  {media: "../ads/adsserver/media/vo_ad_2.mp4", duration : 6000},
                                {media: "../ads/adsserver/media/vo_ad_4.mp4", duration : 4000}]
                    },
                    doubleTriggersInMast: {
                        mastUrl: "../ads/xml/mast/preroll1-preroll2.xml",
                        ads: [  {media: "../ads/adsserver/media/vo_ad_2.mp4", duration : 6000},
                                {media: "../ads/adsserver/media/vo_ad_4.mp4", duration : 4000}]
                    },
                    doubleVastsInTrigger: {
                        mastUrl: "../ads/xml/mast/preroll-vast30-doubleVastsInTrigger.xml",
                        ads: [  {media: "../ads/adsserver/media/vo_ad_2.mp4", duration : 6000},
                                {media: "../ads/adsserver/media/vo_logo.png", duration : 5000}]
                    }
                }
            }
        };
    };

    var _getInstance = function() {
        if (!this._instance) {
            this._instance = _createInstance();
        }
        return this._instance;
    };

    return _getInstance();
});
