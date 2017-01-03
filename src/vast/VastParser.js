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

/** Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive
 *
 * Reason: VAST-3.0 support for Linear Ads.
 * Author: alain.lebreton@viaccess-orca.com
 * Ref: CSWP-28
 *
 */

/**
* VAST parser. This class parses VAST file in XML format
* and construct the corresponding VAST object according to VAST data model.
*/

import vast from './model/Vast';
import xmldom from '../utils/xmldom';
import Debug from '../Debug';

class VastParser {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _getTrackingEvent (trackingNode) {
        let trackingEvent = new vast.TrackingEvent();

        trackingEvent.event = trackingNode.getAttribute('event');
        trackingEvent.uri = xmldom.getNodeTextValue(trackingNode);
        if (trackingEvent.event == "progress") {
            var offsetValue = trackingNode.getAttribute('offset');
            if (offsetValue.indexOf("%") == -1) {
                /* convert HH:MM:SS ( or HH:MM:SS.mmm) in seconds */
                trackingEvent.offsetInSeconds = new Date('1970-01-01T' + offsetValue + 'Z').getTime() / 1000;
            }
            else {
                trackingEvent.offsetPercent = offsetValue.substring(0, offsetValue.indexOf("%")) / 100;
            }
        }

        return trackingEvent;
    }

    _getVideoClicks (videoClicksNode) {
        let videoClicks = new vast.VideoClicks(),
            nodeName,
            nodeValue;

        for (let i = 0; i < videoClicksNode.childNodes.length; i++) {
            nodeName = videoClicksNode.childNodes[i].nodeName;

            switch (nodeName) {
                case "ClickThrough":
                    nodeValue = xmldom.getElement(videoClicksNode,"ClickThrough");
                    videoClicks.clickThrough = new vast.Click();
                    videoClicks.clickThrough.id = nodeValue.getAttribute('id');
                    videoClicks.clickThrough.uri = xmldom.getNodeTextValue(nodeValue);
                    break;
                case "ClickTracking":
                    nodeValue = xmldom.getElement(videoClicksNode,"ClickTracking");
                    videoClicks.clickTracking = new vast.Click();
                    videoClicks.clickTracking.id = nodeValue.getAttribute('id');
                    videoClicks.clickTracking.uri = xmldom.getNodeTextValue(nodeValue);
                    break;
                case "CustomClick":
                    nodeValue = xmldom.getElement(videoClicksNode,"CustomClick");
                    videoClicks.customClick = new vast.Click();
                    videoClicks.customClick.id = nodeValue.getAttribute('id');
                    videoClicks.customClick.uri = xmldom.getNodeTextValue(nodeValue);
                    break;
            }
        }

        return videoClicks;
    }

    _getMediaFile (mediaFileNode) {
        let mediaFile = new vast.MediaFile();

        mediaFile.id = mediaFileNode.getAttribute('id');
        mediaFile.delivery = mediaFileNode.getAttribute('delivery');
        mediaFile.type = mediaFileNode.getAttribute('type');
        mediaFile.bitrate = mediaFileNode.getAttribute('bitrate');
        mediaFile.minBitrate = mediaFileNode.getAttribute('minBitrate');
        mediaFile.maxBitrate = mediaFileNode.getAttribute('maxBitrate');
        mediaFile.codec = mediaFileNode.getAttribute('codec');
        mediaFile.width = mediaFileNode.getAttribute('width');
        mediaFile.height = mediaFileNode.getAttribute('height');
        mediaFile.scalable = mediaFileNode.getAttribute('scalable');
        mediaFile.maintainAspectRatio = mediaFileNode.getAttribute('maintainAspectRatio');
        mediaFile.apiFramework = mediaFileNode.getAttribute('apiFramework');
        mediaFile.uri = xmldom.getNodeTextValue(mediaFileNode);

        return mediaFile;
    }

    _getIcons (iconsNodes) {
        if (iconsNodes) {
            this._debug.warn("(VastParser) VAST/Ad/InLine/Creatives/Creative/Linear/Icons not supported ");
        }
        return null;
    }

    _getAdParameters (adParametersNode){
        var adParameters = new vast.AdParameters();

        adParameters.metadata = xmldom.getNodeTextValue(adParametersNode);
        adParameters.xmlEncoded = adParametersNode.getAttribute('xmlEncoded');

        return adParameters;
    }

    _getLinear (linearNode) {
        let linear = new vast.Linear(),
            trackingNodes,
            videoClicksNode,
            mediaFileNodes,
            adParametersNode,
            iconsNodes,
            i;

        var offsetValue = linearNode.getAttribute('offset');
        if (offsetValue) {
            if (offsetValue.indexOf("%") == -1) {
                /* convert HH:MM:SS ( or HH:MM:SS.mmm) in seconds */
                linear.offsetInSeconds = new Date('1970-01-01T' + offsetValue + 'Z').getTime() / 1000;
            }
            else {
                linear.offsetPercent = offsetValue.substring(0, offsetValue.indexOf("%")) / 100;
            }
        }

        adParametersNode = xmldom.getElement(linearNode, 'AdParameters');
        if (adParametersNode) {
            linear.adParameters = this._getAdParameters(adParametersNode);
        }

        linear.duration = xmldom.getChildNodeTextValue(linearNode, 'Duration');

        trackingNodes = xmldom.getSubElements(linearNode, 'TrackingEvents', 'Tracking');
        for (i = 0; i < trackingNodes.length; i++) {
            linear.trackingEvents.push(this._getTrackingEvent(trackingNodes[i]));
        }

        videoClicksNode = xmldom.getElement(linearNode, 'VideoClicks');
        if (videoClicksNode) {
            linear.videoClicks = this._getVideoClicks(videoClicksNode);
        }

        mediaFileNodes = xmldom.getSubElements(linearNode, 'MediaFiles', 'MediaFile');
        for (i = 0; i < mediaFileNodes.length; i++) {
            linear.mediaFiles.push(this._getMediaFile(mediaFileNodes[i]));
        }

        iconsNodes = xmldom.getElement(linearNode, 'Icons');
        if (iconsNodes) {
            linear.icons = this._getIcons(iconsNodes);
        }

        return linear;
    }

    _getCreative (creativeNode) {
        let creative = new vast.Creative(),
            linearNode,
            companionNode,
            nonLinearNode;

        creative.id = creativeNode.getAttribute('id');
        creative.adId = creativeNode.getAttribute('AdID');
        creative.sequence = creativeNode.getAttribute('sequence');
        creative.apiFramework = creativeNode.getAttribute('apiFramework');

        linearNode = xmldom.getElement(creativeNode, 'Linear');
        if (linearNode) {
            creative.linear = this._getLinear(linearNode);
        }

        companionNode = xmldom.getElement(creativeNode, 'CompanionAds');
        if (companionNode) {
            this._debug.warn("(VastParser) VAST/Ad/InLine/Creatives/Creative/CompanionAds not supported ");
        }

        nonLinearNode = xmldom.getElement(creativeNode, 'NonLinearAds');
        if (nonLinearNode) {
            this._debug.warn("(VastParser) VAST/Ad/InLine/Creatives/Creative/NonLinearAds not supported ");
        }

        return creative;
    }

    _getPricing (pricingNode) {
        var pricing = new vast.Pricing();

        pricing.model = pricingNode.getAttribute('model');
        pricing.currency = pricingNode.getAttribute('currency');
        pricing.price = xmldom.getNodeTextValue(pricingNode);

        return pricing;
    }

    _getAdSystem (adSystemNode) {
        var adSystem = new vast.AdSystem();

        adSystem.version = adSystemNode.getAttribute('version');
        adSystem.name = xmldom.getNodeTextValue(adSystemNode);

        return adSystem;
    }

    _getImpressions (impressionNodes){
        var impressions=[];

        for (var i = 0; i < impressionNodes.length; i++) {
            var impression = new vast.Impression();
            impression.id = impressionNodes[i].getAttribute('id');
            impression.uri = xmldom.getNodeTextValue(impressionNodes[i]);
            impressions.push(impression);
        }

        return impressions;
    }

    _getInLine (adNode) {
        let inLine = new vast.InLine(),
            inLineNode = xmldom.getElement(adNode, 'InLine'),
            adSystemNode = null,
            pricingNode = null,
            impressionNodes,
            creativeNodes,
            i;

        if (inLineNode === null) {
            return null;
        }

        adSystemNode = xmldom.getElement(inLineNode, 'AdSystem');
        if (adSystemNode !== null) {
            inLine.adSystem = this._getAdSystem(adSystemNode);
        }
        inLine.adTitle = xmldom.getChildNodeTextValue(inLineNode, 'AdTitle');
        inLine.description = xmldom.getChildNodeTextValue(inLineNode, 'Description');
        inLine.advertiser = xmldom.getChildNodeTextValue(inLineNode, 'Advertiser');

        pricingNode = xmldom.getElement(inLineNode, 'Pricing');
        if (pricingNode !== null) {
            inLine.pricing = this._getPricing(pricingNode);
        }
        inLine.survey = xmldom.getChildNodeTextValue(inLineNode, 'Survey');
        inLine.error = xmldom.getChildNodeTextValue(inLineNode, 'Error');

        impressionNodes = xmldom.getElements(inLineNode, 'Impression');
        if (impressionNodes !== null) {
            inLine.impressions = this._getImpressions(impressionNodes);
        }

        creativeNodes = xmldom.getSubElements(inLineNode, 'Creatives', 'Creative');
        for (i = 0; i < creativeNodes.length; i++) {
            inLine.creatives.push(this._getCreative(creativeNodes[i]));
        }

        return inLine;
    }

    _getWrapper (adNode) {
        let wrapperNode = xmldom.getElement(adNode, 'Wrapper');

        if (wrapperNode !== null) {
            this._debug.warn("(VastParser) VAST/Ad/Wrapper not supported ");
        }

        return null;
    }

    _getAd (adNode, vast_, adIndex) {
        vast_.ads[adIndex] = new vast.Ad();
        vast_.ads[adIndex].id = adNode.getAttribute('id');
        vast_.ads[adIndex].sequence = adNode.getAttribute('sequence');
        vast_.ads[adIndex].inLine = this._getInLine(adNode);
        vast_.ads[adIndex].wrapper = this._getWrapper(adNode);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._debug = Debug.getInstance();
    }

    /**
    * Parses the VAST XML DOM and get the triggers.
    * @param {object} xmlDom - the XML DOM to parse
    */
    parse (xmlDom) {
        let vast_ = new vast.Vast(),
            vastNode = xmldom.getElement(xmlDom, 'VAST');

        if (vastNode === null) {
            return vast_;
        }

        vast_.version = vastNode.getAttribute('version');

        var numberOfAds = vastNode.getElementsByTagName('Ad').length;
        var adNodes = xmldom.getElements(vastNode, 'Ad');

        if (adNodes === null) {
            return vast_;
        }

        for (var adIndex = 0; adIndex < numberOfAds; adIndex++)
            this._getAd(adNodes[adIndex], vast_, adIndex);

        return vast_;
    }
}

export default VastParser;
