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
* VAST parser. This class parses VAST file in XML format
* and construct the corresponding VAST object according to VAST data model.
*/

import vast from './model/Vast';
import xmldom from '../utils/xmldom';

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
    }

    _getMediaFile (mediaFileNode) {
        let mediaFile = new vast.MediaFile();

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
    }

    _getLinear (linearNode) {
        let linear = new vast.Linear(),
            trackingNodes,
            videoClicksNode,
            mediaFileNodes,
            i;

        linear.duration = xmldom.getChildNodeTextValue(linearNode, 'Duration');
        linear.adParameters = xmldom.getChildNodeTextValue(linearNode, 'AdParameters');

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

        return linear;
    }

    _getCreative (creativeNode) {
        let creative = new vast.Creative(),
            linearNode;

        creative.id = creativeNode.getAttribute('id');
        creative.adId = creativeNode.getAttribute('AdID');
        creative.sequence = creativeNode.getAttribute('sequence');

        linearNode = xmldom.getElement(creativeNode, 'Linear');
        if (linearNode) {
            creative.linear = this._getLinear(linearNode);
        }

        // TODO: get Companion and non-Linear elements

        return creative;
    }

    _getInLine (adNode) {
        let inLine = new vast.InLine(),
            inLineNode = xmldom.getElement(adNode, 'InLine'),
            impressionNodes,
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

        impressionNodes = xmldom.getElements(inLineNode, 'Impression');
        for (i = 0; i < impressionNodes.length; i++) {
            var impression = new vast.Impression();
            impression.id = impressionNodes[i].getAttribute('id');
            impression.uri = xmldom.getNodeTextValue(impressionNodes[i]);
            inLine.impressions.push(impression);

        }

        creativeNodes = xmldom.getSubElements(inLineNode, 'Creatives', 'Creative');
        for (i = 0; i < creativeNodes.length; i++) {
            inLine.creatives.push(this._getCreative(creativeNodes[i]));
        }

        return inLine;
    }

    _getAd (adNode) {
        let ad = new vast.Ad();
        ad.id = adNode.getAttribute('id');
        ad.sequence = adNode.getAttribute('sequence');
        ad.inLine = this._getInLine(adNode);
        return ad;
    }

    _getAds (vastNode, vast_) {
        let adNodes = xmldom.getElements(vastNode, 'Ad');
        for (let i = 0; i < adNodes.length; i++) {
            vast_.ads.push(this._getAd(adNodes[i]));
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
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

        this._getAds(vastNode, vast_);

        return vast_;
    }
}

export default VastParser;
