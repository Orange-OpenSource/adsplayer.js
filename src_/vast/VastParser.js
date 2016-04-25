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

AdsPlayer.vast.VastParser = function () {
    "use strict";
    var parser = new AdsPlayer.utils.DOMParser(),
    /*
    _getAdsList = function() {
        if (_xmlDoc) {
            return 
        }
        return [];
    },*/

// TO BE DONE
    _getImpression = function(theInLineNode) {
        if (theInLineNode){
            var node, impressions = [];
            var impressionNodes = parser.getChildNodes(theInLineNode, 'Impression');
            if (impressionNodes){
                for (var l = 0; l < impressionNodes.length; l++) {
                    var impression = new AdsPlayer.vast.model.Ad.Impressions();
                    impression.uri = impressionNodes[l].textContent;
                    impression.id = parser.getAttributeValue(impressionNodes[l], 'id');
                    impressions.push(impression);
                }
                return impressions;
            }
        }
        return [];
    },

    _getExtentions = function(theInLineNode) {
        if (theInLineNode){
            var node, extensions = [];
            var extensionNodes = parser.getChildNodes(theInLineNode, 'Extensions');
            if (extensionNodes){
                for (var l = 0; l < extensionNodes.length; l++) {
                    var extension = new AdsPlayer.vast.model.Ad.Extensions();
                    extension.uri = extensionNodes[l].textContent;
                    // to do a function in DOMParser which can get the names of the attributes and then we get attributeValue by the function getAttributeValue
                    //extension.id = parser.getAttributeValue(extensionNodes[l], 'id');
                    extension.other = '';                    
                    extensions.push(extension);
                }
                return extensions;
            }
        }        
        return [];
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
            clickThrough.uri = clickthroughNode.textContent;
        }
        return clickThrough;
    },

    _getClickTracking = function(theVideoClicks) {
        var clickTrackings = [],
        i,
        clickTrackingsNode = parser.getChildNodes(theVideoClicks, 'ClickTracking');
        if (clickTrackingsNode) {
            for (i=0; i < clickTrackingsNode.length; i++){
                var clickTracking = new AdsPlayer.vast.model.Ad.Creative.VideoClicks.ClickTracking();
                clickTracking.id = parser.getAttributeValue(clickTrackingsNode[i], 'id');
                clickTracking.uri = clickTrackingsNode[i].textContent;
            }
            clickTrackings.push(clickTracking);
        }
        return clickTrackings;
    },

    _getCustomClick = function(theVideoClicks) {
        var customClicks = [],
        i,
        customClicksNode = parser.getChildNodes(theVideoClicks, 'CustomClick');
        if (customClicksNode) {
            for (i=0; i < customClicksNode.length; i++){
                var customClick = new AdsPlayer.vast.model.Ad.Creative.VideoClicks.CustomClick();
                customClick.id = parser.getAttributeValue(customClicksNode[i], 'id');
                customClick.uri = customClicksNode[i].textContent;
            }
            customClicks.push(customClick);
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
            i;
        if (trackingNode) {
            var trackingNode = parser.getChildNodes(trackingNode, 'Tracking')
            for (i = 0; i<trackingNode.length; i++) {
                var TrackingEvent = new AdsPlayer.vast.model.Ad.TrackingEvent();
                TrackingEvent.event = parser.getAttributeValue(trackingNode[i], 'event');
                TrackingEvent.uri = trackingNode[i].textContent;
                trackingEvents.push(TrackingEvent);
            }
        }
        return trackingEvents;
    },


    _getMediafiles = function(theLinear) {
        var mediaFilesNode = parser.getChildNode(theLinear, 'MediaFiles'),
            mediaFiles = [],
            i=0;
        if (mediaFilesNode) {
            var mediaFileNode = parser.getChildNodes(mediaFilesNode, 'MediaFile')
            for (i = 0; i<mediaFileNode.length; i++) {
                var mediaFile = new AdsPlayer.vast.model.Ad.Creative.MediaFile();

                mediaFile.id = parser.getAttributeValue(mediaFileNode[i], 'id');
                mediaFile.delivery = parser.getAttributeValue(mediaFileNode[i], 'delivery');
                mediaFile.type = parser.getAttributeValue(mediaFileNode[i], 'type');
                mediaFile.bitrate = parser.getAttributeValue(mediaFileNode[i], 'bitrate');
                mediaFile.width = parser.getAttributeValue(mediaFileNode[i], 'width');
                mediaFile.height = parser.getAttributeValue(mediaFileNode[i], 'height');
                mediaFile.scalable = parser.getAttributeValue(mediaFileNode[i], 'scalable');
                mediaFile.maintainAspectRatio = parser.getAttributeValue(mediaFileNode[i], 'maintainAspectRatio');
                mediaFile.apiFramework = parser.getAttributeValue(mediaFileNode[i], 'apiFramework');
                mediaFile.uri = mediaFileNode[i].textContent;
                mediaFiles.push(mediaFile);
            }
        }
        return mediaFiles;
    },

    _getLinearObject = function(creative) {
        var linearNode = parser.getChildNode(creative, 'Linear'),
            linear = new AdsPlayer.vast.model.Ad.Creative.Linear(),
            node = null;
        if (linearNode) {
            linear.duration = ((node = parser.getChildNode(linearNode, 'Duration'))? node.textContent: '');
            linear.adParameters = ((node = parser.getChildNode(linearNode, 'AdParameters'))? node.textContent: '');
            linear.mediaFiles = _getMediafiles(linearNode);  
            linear.trackingEvents = _getTrackingEvents(linearNode);
            linear.videoClicks = _getVideoClicks(linearNode);
            return linear;
        }
        return null;
    },

    _getCreatives = function(theInLineNode) {
        if (theInLineNode) {
            var node, creatives = [];
            var creativeNodes = parser.getChildNodes(parser.getChildNode(theInLineNode, 'Creatives'), 'Creative');
            //var creativeNodes = parser.getChildNode(theInLineNode, 'Creatives');
            if (creativeNodes){
                for (var k = 0; k < creativeNodes.length; k++) {
                    var creative = new AdsPlayer.vast.model.Ad.Creative();
                    creative.id = parser.getAttributeValue(creativeNodes[k], 'id');
                    creative.adId = parser.getAttributeValue(creativeNodes[k], 'AdID');
                    creative.sequence = parser.getAttributeValue(creativeNodes[k], 'sequence');                    
                    creative.linear = _getLinearObject(creativeNodes[k]);
                    creative.CompanionAds = []; // TO DO
                    creative.nonLinearAds = []; // TO DO
                    creatives.push(creative);
                }
            }
            return creatives;
        }
        return [];
    },


    _parse = function(vastDom) {

        // ATTENTION Wrapper, CompanionAds and nonLinearAds are not handeled. To be done later

        //CompanionAds 
        //nonLinearAds
        var node;
        //_createXmlTree(vastDom);
        // VAST is the main node, it containes verstion (attribute) and list of Ad structure
        var vast = new AdsPlayer.vast;
        vast.version = parser.getAttributeValue(parser.getChildNode(vastDom, 'VAST'), 'version');

        // get Ad list to be associated to VAST
        var adsNode = parser.getChildNodes(parser.getChildNode(vastDom, 'VAST'), 'Ad');
        for (var i=0; i<adsNode.length; i++ ){
            var myAd = new AdsPlayer.vast.model.Ad();
            myAd.id = parser.getAttributeValue(adsNode[i], 'id');
            // *************get InLine and its attributes and listes********************
            var inLine = new AdsPlayer.vast.model.Ad.InLine();
            var inLineNode = parser.getChildNode(adsNode[i], 'InLine');
            //Get all inLine attributes 
            inLine.adSystem = ((node = parser.getChildNode(inLineNode, 'AdSystem'))? node.textContent: '');
            inLine.adTitle = ((node = parser.getChildNode(inLineNode, 'AdTitle'))? node.textContent: '');
            inLine.description = ((node = parser.getChildNode(inLineNode, 'Description'))? node.textContent: '');
            inLine.survey = ((node = parser.getChildNode(inLineNode, 'Survey'))? node.textContent: '');
            inLine.error = ((node = parser.getChildNode(inLineNode, 'Error'))? node.textContent: '');
            inLine.impression = _getImpression(inLineNode);
            inLine.creatives = _getCreatives(inLineNode);
            inLine.extentions = _getExtentions(inLineNode);
            myAd.inLine = inLine;
            // ************* END of InLine attributes and listes********************


            // associate clickthrough, clicktraking and customClick to videolick
            // associate mediafil and videolick to linear
            // associate linear, compagnon and nonlinear to creative
            // associate creative, impression and extentions to inLine
            // associate linear and wrapper to ad
            // associate ads to vast
            vast.ads.push(myAd);
        } // end of for adsList
        console.log(vast) ; 
        /* for this first version of vast parser we return only trhe likst of ads and their mediafil {url, mimtype} 
        return vast;     // for future veersions, all vast object must be returned by this function
       */
        var listAds = [];
        var i,j ;
        for (i = 0; i < vast.ads.length; i++) {
            for (j = 0; j < vast.ads[i].inLine.creatives.length; j++) {
                if(vast.ads[i].inLine.creatives[j].linear){
                    var linear = {};
                    linear.id = vast.ads[i].id;
                    linear.creativeId = vast.ads[i].inLine.creatives[j].id;
                    linear.mediaFiles = vast.ads[i].inLine.creatives[j].linear.mediaFiles;
                    linear.videoClicks = vast.ads[i].inLine.creatives[j].linear.videoClicks;
                    listAds.push(linear);
                }
            }
        }
         return listAds;
    };



    return {

        init: function () {
            // to be used later
        },

        parse : function (vastDom) {
           
           return _parse(vastDom);
        },

        load: function (vastUrl) {
            // this function must be handled by AdsPlayerController

        }
    };
};

AdsPlayer.vast.VastParser.prototype = {
    constructor: AdsPlayer.vast.VastParser
};
