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

AdsPlayer.Vast.VastParser = function () {
    "use strict";
    var parser = new AdsPlayer.utils.DOMParser(),
    _xmlDoc=null,

    _createXmlTree = function(data) {
        _xmlDoc = parser.createXmlTree(data);
    },

    _getAdsList = function() {
        if (_xmlDoc) {
            return parser.getChildNodes(parser.getChildNode(_xmlDoc, 'VAST'), 'Ad');
        }
        return [];
    },

// TO BE DONE
    _getImpression = function(theInLineNode) {
        if (theInLineNode){
            var node, impressions = [];
            var impressionNodes = parser.getChildNodes(theInLineNode, 'Impression');
            if (impressionNodes){
                for (var l = 0; l < impressionNodes.length; l++) {
                    var impression = {};
                    impression.uri = impressionNodes[l].innerHTML;
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
                    var extension = {};
                    extension.uri = extensionNodes[l].innerHTML;
                    // to do a function in DOMParser which can get the names of the attributes and then we get attributeValue by the function getAttributeValue
                    //extension.id = parser.getAttributeValue(extensionNodes[l], 'id');
                    extension.id = '';                    
                    extensions.push(extension);
                }
                return extensions;
            }
        }        
        return [];
    },

    _getMediafiles = function() {
               var linearNode = parser.getChildNode(creative, 'Linear');
        var linear = new AdsPlayer.Vast.Ad.Creative.Linear();

        linear.duration = (parser.getChildNode(linearNode, 'Duration')? linearNode.innerHTML: '');
        linear.adParameters = (parser.getChildNode(linearNode, 'AdParameters')? linearNode.innerHTML: '');
        linear.trackingEvents = []; // TO DO
        linear.videoClicks = null; // TO DO
        linear.mediaFiles = _getMediafiles(linearNode);    
        return linear;

    },

    _getClickThrough = function() {

    },

    _getClickTracking = function() {

    },

    _getCustomClick = function() {

    },

    _getVideoClicks = function() {

    },

    _getTrackingEvents = function() {

    },
/*  
AdsPlayer.Vast.Ad.Creative.MediaFile = function () {
    "use strict";

    this.id = '';                   // optional : identifier
    this.delivery = '';             // required: Method of delivery of ad
    this.type = '';                 // required : MIME type
    this.bitrate = 0;               // optional : bitrate of encoded video in Kbps 
    this.width = 0;                 // requierd : Pixel dimensions of video
    this.height = 0;                // requierd : Pixel dimensions of video
    this.scalable=true;             // optional : whether it is acceptable to scale the image.
    this.maintainAspectRatio=true;  // optional : whether the ad must have its aspect ratio maintained when scaled
    this.apiFramework='';           // optional : defines the method to use for communication if the MediaFile is interactive. 
};

MediaFile delivery="progressive" type="video/x-flv" bitrate="500" width="400" height="300" scalable="true" maintainAspectRatio="true">http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.flv</MediaFile>
apiFramework="" bitrate="" delivery="" height="" id="" maintainAspectRatio="" scalable="" type="" width=""
*/


    _getMediafiles = function(theLinear) {
        var mediaFilesNode = parser.getChildNode(theLinear, 'MediaFiles'),
            mediaFiles = [],
            i=0;
        if (mediaFilesNode) {
            var mediaFileNode = parser.getChildNodes(mediaFilesNode, 'MediaFile')
            for (i = 0; i<mediaFileNode.length; i++) {
                var mediaFile = new AdsPlayer.Vast.Ad.Creative.MediaFile();

                mediaFile.id = parser.getAttributeValue(mediaFileNode[i], 'id');
                mediaFile.delivery = parser.getAttributeValue(mediaFileNode[i], 'delivery');
                mediaFile.type = parser.getAttributeValue(mediaFileNode[i], 'type');
                mediaFile.bitrate = parser.getAttributeValue(mediaFileNode[i], 'bitrate');
                mediaFile.width = parser.getAttributeValue(mediaFileNode[i], 'width');
                mediaFile.height = parser.getAttributeValue(mediaFileNode[i], 'height');
                mediaFile.scalable = parser.getAttributeValue(mediaFileNode[i], 'scalable');
                mediaFile.maintainAspectRatio = parser.getAttributeValue(mediaFileNode[i], 'maintainAspectRatio');
                mediaFile.apiFramework = parser.getAttributeValue(mediaFileNode[i], 'apiFramework');
                mediaFiles.push(mediaFile);
            }
        }
        return mediaFiles;
    },

    _getLinearObject = function(creative) {
        var linearNode = parser.getChildNode(creative, 'Linear'),
            linear = new AdsPlayer.Vast.Ad.Creative.Linear(),
            node = null;
        if (linearNode) {
            linear.duration = ((node = parser.getChildNode(linearNode, 'Duration'))? node.innerHTML: '');
            linear.adParameters = ((node = parser.getChildNode(linearNode, 'AdParameters'))? node.innerHTML: '');
            linear.trackingEvents = []; // TO DO
            linear.videoClicks = null; // TO DO
            linear.mediaFiles = _getMediafiles(linearNode);    
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
                    var creative = new AdsPlayer.Vast.Ad.Creative();
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


    _parse = function(vastFileContent) {

        // ATTENTION Wrapper, CompanionAds and nonLinearAds are not handeled. To be done later

        //CompanionAds 
        //nonLinearAds
        var node;
        _createXmlTree(vastFileContent);
        // VAST is the main node, it containes verstion (attribute) and list of Ad structure
        var vast = new AdsPlayer.Vast;
        vast.version = parser.getAttributeValue(parser.getChildNode(_xmlDoc, 'VAST'), 'version')
        // get Ad list to be associated to VAST
        var adsNode = _getAdsList();
        for (var i=0; i<adsNode.length; i++ ){
            var myAd = new AdsPlayer.Vast.Ad();
            myAd.id = parser.getAttributeValue(adsNode[i], 'id');
            // *************get InLine and its attributes and listes********************
            var inLine = new AdsPlayer.Vast.Ad.InLine();
            var inLineNode = parser.getChildNode(adsNode[i], 'InLine');
            //Get all inLine attributes 
            inLine.adSystem = ((node = parser.getChildNode(inLineNode, 'AdSystem'))? node.innerHTML: '');
            inLine.adTitle = ((node = parser.getChildNode(inLineNode, 'AdTitle'))? node.innerHTML: '');
            inLine.description = ((node = parser.getChildNode(inLineNode, 'Description'))? node.innerHTML: '');
            inLine.survey = ((node = parser.getChildNode(inLineNode, 'Survey'))? node.innerHTML: '');
            inLine.error = ((node = parser.getChildNode(inLineNode, 'Error'))? node.innerHTML: '');
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
        return vast;     
    };



    return {

        init: function () {
            // to be used later
        },

        parse : function (vastFileContent) {
           
           return _parse(vastFileContent);
        },

        load: function (vastUrl) {
            // this function must be handled by AdsPlayerController

        }
    };
};

AdsPlayer.Vast.VastParser.prototype = {
    constructor: AdsPlayer.Vast.VastParser
};
