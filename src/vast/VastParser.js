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

AdsPlayer.vast.VastParser = function(vastBaseUrl) {
    "use strict";

    var _vastBaseUrl = vastBaseUrl;
    var parser = new AdsPlayer.utils.DOMParser(),
        /*
    _getAdsList = function() {
        if (_xmlDoc) {
            return 
        }
        return [];
    },*/

        _checkUri = function (uri) {
            if (uri.indexOf('http://') === -1) {
                uri = _vastBaseUrl + uri;
            }
            return uri;
        },

        _convertTime = function(timingStr)
        {
            var timeParts,
                parsedTime,
                SECONDS_IN_HOUR = 60 * 60,
                SECONDS_IN_MIN = 60;

            timeParts = timingStr.split(":");

            parsedTime = (parseFloat(timeParts[0]) * SECONDS_IN_HOUR +
                parseFloat(timeParts[1]) * SECONDS_IN_MIN +
                parseFloat(timeParts[2]));

            return parsedTime;

        },


        _getImpression = function(theInLineNode) {
            var impressions = [];
            if (theInLineNode) {
                var impressionNodes = parser.getChildNodes(theInLineNode, 'Impression'),
                    i;
                if (impressionNodes) {
                    for (i = 0; i < impressionNodes.length; i++) {
                        var impression = new AdsPlayer.vast.model.Ad.Impressions();
                        impression.uri = _checkUri(parser.getNodeValue(impressionNodes[i]));
                        impression.id = parser.getAttributeValue(impressionNodes[i], 'id');
                        impressions.push(impression);
                    }
                }
            }
            return impressions;
        },

        _getExtentions = function(theInLineNode) {
            var extensions = [];
            if (theInLineNode) {
                var i,
                    extensionNodes = parser.getChildNodes(theInLineNode, 'Extensions');
                if (extensionNodes) {
                    for (i = 0; i < extensionNodes.length; i++) {
                        var extension = new AdsPlayer.vast.model.Ad.Extensions();
                        extension.uri = _checkUri(parser.getNodeValue(extensionNodes[i]));
                        // dor "other" It must add a function in DOMParser which can get the names of the attributes and then we get attributeValue by the function getAttributeValue
                        extension.other = '';
                        extensions.push(extension);
                    }
                }
            }
            return extensions;
        },
        /*
    _getMediafiles = function() {
               var linearNode = parser.getChildNode(creative, 'Linear');
        var linear = new AdsPlayer.vast.model.Ad.Creative.Linear();

        linear.duration = (parser.getChildNode(linearNode, 'Duration')? linearNode.textContent: '');
        linear.adParameters = (parser.getChildNode(linearNode, 'AdParameters')? linearNode.textContent: '');
        linear.trackingEvents = []; // TO DO
        linear.videoClicks = null; // TO DO
        linear.mediaFiles = _getMediafiles(linearNode);    
        return linear;

    },
*/
        _getClickThrough = function(theVideoClicks) {
            var clickthroughNode = parser.getChildNode(theVideoClicks, 'ClickThrough'), // there is only one clickthrough node
                clickThrough = new AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickThrough();
            if (clickthroughNode) {
                clickThrough.id = parser.getAttributeValue(clickthroughNode, 'id');
                clickThrough.uri = _checkUri(parser.getNodeValue(clickthroughNode));
            }
            return clickThrough;
        },

        _getClickTracking = function(theVideoClicks) {
            var clickTrackings = [],
                i,
                clickTracking,
                clickTrackingsNode = parser.getChildNodes(theVideoClicks, 'ClickTracking');
            if (clickTrackingsNode) {
                for (i = 0; i < clickTrackingsNode.length; i++) {
                    clickTracking = new AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickTracking();
                    clickTracking.id = parser.getAttributeValue(clickTrackingsNode[i], 'id');
                    clickTracking.uri = _checkUri(parser.getNodeValue(clickTrackingsNode[i]));
                    clickTrackings.push(clickTracking);
                }
            }
            return clickTrackings;
        },

        _getCustomClick = function(theVideoClicks) {
            var customClicks = [],
                i,customClick,
                customClicksNode = parser.getChildNodes(theVideoClicks, 'CustomClick');
            if (customClicksNode) {
                for (i = 0; i < customClicksNode.length; i++) {
                    customClick = new AdsPlayer.vast.model.Ad.Creative.VideoClicks.CustomClick();
                    customClick.id = parser.getAttributeValue(customClicksNode[i], 'id');
                    customClick.uri = _checkUri(parser.getNodeValue(customClicksNode[i]));
                    customClicks.push(customClick);
                }
            }
            return customClicks;
        },

        _getVideoClicks = function(theLinear) {
            var videoClicksNode = parser.getChildNode(theLinear, 'VideoClicks'),
                videoClicks = new AdsPlayer.vast.model.Ad.Creative.VideoClicks();
            if (videoClicksNode) {
                videoClicks.clickThrough = _getClickThrough(videoClicksNode);
                videoClicks.clickTracking = _getClickTracking(videoClicksNode);
                videoClicks.customClick = _getCustomClick(videoClicksNode);
            }
            return videoClicks;
        },

        _getTrackingEvents = function(theLinear) {
            var trackingNode = parser.getChildNode(theLinear, 'TrackingEvents'),
                trackingEvents = [],
                TrackingEvent,
                i;
            if (trackingNode) {
                trackingNode = parser.getChildNodes(trackingNode, 'Tracking');
                for (i = 0; i < trackingNode.length; i++) {
                    TrackingEvent = new AdsPlayer.vast.model.Ad.TrackingEvent();
                    TrackingEvent.event = parser.getAttributeValue(trackingNode[i], 'event');
                    TrackingEvent.uri = _checkUri(parser.getNodeValue(trackingNode[i]));
                    trackingEvents.push(TrackingEvent);
                }
            }
            return trackingEvents;
        },


        _getMediafiles = function(theLinear) {
            var mediaFilesNode = parser.getChildNode(theLinear, 'MediaFiles'),
                mediaFiles = [],
                mediaFile,
                i = 0;
            if (mediaFilesNode) {
                var mediaFileNode = parser.getChildNodes(mediaFilesNode, 'MediaFile');
                for (i = 0; i < mediaFileNode.length; i++) {
                    mediaFile = new AdsPlayer.vast.model.Ad.Creative.MediaFile();

                    mediaFile.id = parser.getAttributeValue(mediaFileNode[i], 'id');
                    mediaFile.delivery = parser.getAttributeValue(mediaFileNode[i], 'delivery');
                    mediaFile.type = parser.getAttributeValue(mediaFileNode[i], 'type');
                    mediaFile.bitrate = parser.getAttributeValue(mediaFileNode[i], 'bitrate');
                    mediaFile.width = parser.getAttributeValue(mediaFileNode[i], 'width');
                    mediaFile.height = parser.getAttributeValue(mediaFileNode[i], 'height');
                    mediaFile.scalable = parser.getAttributeValue(mediaFileNode[i], 'scalable');
                    mediaFile.maintainAspectRatio = parser.getAttributeValue(mediaFileNode[i], 'maintainAspectRatio');
                    mediaFile.apiFramework = parser.getAttributeValue(mediaFileNode[i], 'apiFramework');
                    mediaFile.uri = _checkUri(parser.getNodeValue(mediaFileNode[i]));
                    mediaFiles.push(mediaFile);
                }
            }
            return mediaFiles;
        },

        _getLinearObject = function(creative) {
            var linearNode = parser.getChildNode(creative, 'Linear'),
                linear = new AdsPlayer.vast.model.Ad.Creative.Linear();
            if (linearNode) {
                linear.duration =  _convertTime(parser.getNodeValue(parser.getChildNode(linearNode, 'Duration')));
                linear.adParameters = parser.getNodeValue(parser.getChildNode(linearNode, 'AdParameters'));
                linear.mediaFiles = _getMediafiles(linearNode);
                linear.trackingEvents = _getTrackingEvents(linearNode);
                linear.videoClicks = _getVideoClicks(linearNode);
                return linear;
            }
            return null;
        },

        _getCreatives = function(theInLineNode) {
            var creatives = [],
                creative,
                creativeNodes = parser.getChildNodes(parser.getChildNode(theInLineNode, 'Creatives'), 'Creative'),
                i;
            if (theInLineNode) {
                if (creativeNodes) {
                    for (i = 0; i < creativeNodes.length; i++) {
                        creative = new AdsPlayer.vast.model.Ad.Creative();
                        creative.id = parser.getAttributeValue(creativeNodes[i], 'id');
                        creative.adId = parser.getAttributeValue(creativeNodes[i], 'AdID');
                        creative.sequence = parser.getAttributeValue(creativeNodes[i], 'sequence');
                        creative.linear = _getLinearObject(creativeNodes[i]);
                        creative.CompanionAds = []; // TO DO
                        creative.nonLinearAds = []; // TO DO
                        creatives.push(creative);
                    }
                }
            }
            return creatives;
        },


        _parse = function(vastDom) {

            // ATTENTION Wrapper, CompanionAds and nonLinearAds are not handeled. To be done later

            //CompanionAds 
            //nonLinearAds
            var j,
                i,
                vast = new AdsPlayer.vast.model.Vast();
            vast.version = parser.getAttributeValue(parser.getChildNode(vastDom, 'VAST'), 'version');

            // get Ad list to be associated to VAST
            var adsNode = parser.getChildNodes(parser.getChildNode(vastDom, 'VAST'), 'Ad');
            for (i = 0; i < adsNode.length; i++) {
                var myAd = new AdsPlayer.vast.model.Ad();
                myAd.id = parser.getAttributeValue(adsNode[i], 'id');
                // *************get InLine and its attributes and listes********************
                var inLine = new AdsPlayer.vast.model.Ad.InLine();
                var inLineNode = parser.getChildNode(adsNode[i], 'InLine');
                //Get all inLine attributes 
                inLine.adSystem = parser.getNodeValue(parser.getChildNode(inLineNode, 'AdSystem'));
                inLine.adTitle = parser.getNodeValue(parser.getChildNode(inLineNode, 'AdTitle'));
                inLine.adTitle = parser.getNodeValue(parser.getChildNode(inLineNode, 'Description'));
                inLine.adTitle = parser.getNodeValue(parser.getChildNode(inLineNode, 'Survey'));
                inLine.adTitle = parser.getNodeValue(parser.getChildNode(inLineNode, 'Error'));
                inLine.impression = _getImpression(inLineNode);
                inLine.creatives = _getCreatives(inLineNode);
                inLine.extentions = _getExtentions(inLineNode);
                myAd.inLine = inLine;
                vast.ads.push(myAd);
            }
            return vast;
         };

    return {

        /**
         * [init description]
         * @return {[type]} [description]
         */
        init: function() {
            // to be used later
        },

        /**
         * [parse description]
         * @param  {[type]} vastDom [description]
         * @return {[type]}         [description]
         */
        parse: function(vastDom) {

            return _parse(vastDom);
        },

        /**
         * [load description]
         * @param  {[type]} vastUrl [description]
         * @return {[type]}         [description]
         */
        load: function(vastUrl) {
            // this function must be handled by AdsPlayerController

        }
    };
};

AdsPlayer.vast.VastParser.prototype = {
    constructor: AdsPlayer.vast.VastParser
};