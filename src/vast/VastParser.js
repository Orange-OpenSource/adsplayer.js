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

    var /*_getElement = function(node, name) {
            var elements = node.getElementsByTagName(name);
            if (elements.length !== 1) {
                return null;
            }
            return elements[0];
        },

        _getElements = function(node, name) {
            return node.getElementsByTagName(name);
        },

        _getSubElements = function(node, childNodeName, subChildNodeName) {
            var element = _getElement(node, name);
            if (element === null) {
                return [];
            }
            return element.getElementsByTagName(subName);
        },

        _getChildNode = function (node, name) {
            if (!node || !node.childNodes) {
                return null;
            }
            for (var i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].nodeName === name) {
                    return node.childNodes[i];
                }
            }
            return null;
        },

        _getNodeTextValue = function (node) {
            var cdataSection = _getChildNode(node, '#cdata-section'),
                textSection = _getChildNode(node, '#text');
            if (cdataSection) {
                return cdataSection.nodeValue;
            } else if (textSection) {
                return textSection.nodeValue;
            }
            return '';
        },

        _getChildNodeTextValue = function (node, name) {
            var element = _getElement(node, name);
            if (element === null) {
                return '';
            }
            return _getNodeTextValue(element);
        },*/

        /*_checkUri = function (uri) {
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
         },*/










        _getTrackingEvent = function (trackingNode) {
            var trackingEvent = new AdsPlayer.vast.model.Ad.TrackingEvent();

            trackingEvent.event = trackingNode.getAttribute('event');
            trackingEvent.uri = xmldom.getNodeTextValue(trackingNode);

            return trackingEvent;
        },

        _getVideoClicks = function (videoClicksNode) {
            var videoClicks = new AdsPlayer.vast.model.Ad.Creative.VideoClicks(),
                nodeName,
                nodeValue,
                i;

            for (i = 0; i < videoClicksNode.childNodes.length; i++) {
                nodeName = videoClicksNode.childNodes[i].nodeName;
                nodeValue = xmldom.getNodeTextValue(videoClicksNode.childNodes[i]);

                switch (nodeName) {
                    case "ClickThrough":
                        videoClicks.clickThrough = nodeValue;
                        break;
                    case "ClickTracking":
                        videoClicks.clickTracking = nodeValue;
                        break;
                    case "CustomClick":
                        videoClicks.customClick = nodeValue;
                        break;
                }
            }

            return videoClicks;
        },

        _getMediaFile = function (mediaFileNode) {
            var mediaFile = new AdsPlayer.vast.model.Ad.Creative.MediaFile();

            mediaFile.id = mediaFileNode.getAttribute('id');
            mediaFile.delivery = mediaFileNode.getAttribute('delivery');
            mediaFile.type = mediaFileNode.getAttribute('type');
            mediaFile.bitrate = mediaFileNode.getAttribute('bitrate');
            mediaFile.width = mediaFileNode.getAttribute('width');
            mediaFile.height = mediaFileNode.getAttribute('height');
            mediaFile.scalable = mediaFileNode.getAttribute('scalable');
            mediaFile.maintainAspectRatio = mediaFileNode.getAttribute('maintainAspectRatio');
            mediaFile.apiFramework = mediaFileNode.getAttribute('apiFramework');
            mediaFile.uri = xmldom.getNodeTextValue(mediaFileNode);

            return mediaFile;
        },

        _getLinear = function (linearNode) {
            var linear = new AdsPlayer.vast.model.Ad.Creative.Linear(),
                trackingNodes,
                videoClicksNode,
                mediaFileNodes,
                i;

            linear.duration = xmldom.getChildNodeTextValue(linearNode, 'Duration');
            linear.adParameters = xmldom.getChildNodeTextValue(linearNode, 'AdParameters');

            trackingNodes = xmldom.getSubElements(linearNode, 'TrackingEvents', 'Tracking');
            for (i = 0; i < trackingNodes.length; i++) {
                linear.trackingEvents.push(_getTrackingEvent(trackingNodes[i]));
            }

            videoClicksNode = xmldom.getElement(linearNode, 'VideoClicks');
            if (videoClicksNode) {
                linear.videoClicks = _getVideoClicks(videoClicksNode);
            }

            mediaFileNodes = xmldom.getSubElements(linearNode, 'MediaFiles', 'MediaFile');
            for (i = 0; i < mediaFileNodes.length; i++) {
                linear.mediaFiles.push(_getMediaFile(mediaFileNodes[i]));
            }

            return linear;
        },

        _getCreative = function (creativeNode) {
            var creative = new AdsPlayer.vast.model.Ad.Creative(),
                linearNode;

            creative.id = creativeNode.getAttribute('id');
            creative.adId = creativeNode.getAttribute('AdID');
            creative.sequence = creativeNode.getAttribute('sequence');

            linearNode = xmldom.getElement(creativeNode, 'Linear');
            if (linearNode) {
                creative.linear = _getLinear(linearNode);
            }

            // TODO: get Companion and non-Linear elements

            return creative;
        },

        _getInLine = function(adNode) {
            var inLine = new AdsPlayer.vast.model.Ad.InLine(),
                inLineNode = xmldom.getElement(adNode, 'InLine'),
                impressionNode,
                creativeNodes,
                i;

            if (inLineNode === null) {
                return null;
            }

            inLine.adSystem = xmldom.getChildNodeTextValue(inLineNode, 'AdSystem');
            inLine.adTitle = xmldom.getChildNodeTextValue(inLineNode, 'AdTitle');
            inLine.description = xmldom.getChildNodeTextValue(inLineNode, 'Description');
            inLine.survey = xmldom.getChildNodeTextValue(inLineNode, 'Survey');
            inLine.error = xmldom.getChildNodeTextValue(inLineNode, 'Error');

            impressionNode = xmldom.getElement(inLineNode, 'Impression');
            if (impressionNode) {
                inLine.impression = new AdsPlayer.vast.model.Ad.Impression();
                inLine.impression.id = impressionNode.getAttribute('id');
                inLine.impression.uri = xmldom.getNodeTextValue(impressionNode);
            }

            creativeNodes = xmldom.getSubElements(inLineNode, 'Creatives', 'Creative');
            for (i = 0; i < creativeNodes.length; i++) {
                inLine.creatives.push(_getCreative(creativeNodes[i]));
            }

            return inLine;
        },

        _getAd = function(vastNode, vast) {
            var adNode = xmldom.getElement(vastNode, 'Ad');

            if (adNode === null) {
                return;
            }

            vast.ad = new AdsPlayer.vast.model.Ad();
            vast.ad.id = adNode.getAttribute('id');
            vast.ad.inLine = _getInLine(adNode);
        };

    return {

        /**
        * Parses the VAST XML DOM and get the triggers.
        * @param {object} xmlDom - the XML DOM to parse
        */
        parse: function(xmlDom) {
            var vast = new AdsPlayer.vast.model.Vast(),
                vastNode = xmldom.getElement(xmlDom, 'VAST');

            if (vastNode === null) {
                return vast;
            }

            vast.version = vastNode.getAttribute('version');

            _getAd(vastNode, vast);

            return vast;
        }
    };
};

AdsPlayer.vast.VastParser.prototype = {
    constructor: AdsPlayer.vast.VastParser
};