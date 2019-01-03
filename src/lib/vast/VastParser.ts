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

import * as vast from './model/Vast';
import { XmlDom } from '../utils/xmldom';

export class VastParser {

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
    }

    /**
    * Parses the VAST XML DOM and get the triggers.
    * @param {object} xmlDom - the XML DOM to parse
    */
    parse (xmlDom: Document) {
        let vast_: vast.Vast  = new vast.Vast(),
            vastNode = XmlDom.getElement(xmlDom, 'VAST');

        if (vastNode === null) {
            return vast_;
        }

        vast_.version = vastNode.getAttribute('version');

        this.getAds(vastNode, vast_);

        return vast_;
    }

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------    
    
    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private getTrackingEvent (trackingNode): vast.TrackingEvent {
        let trackingEvent: vast.TrackingEvent = new vast.TrackingEvent();

        trackingEvent.event = trackingNode.getAttribute('event');
        trackingEvent.uri = XmlDom.getNodeTextValue(trackingNode);
        if (trackingEvent.event == 'progress') {
            let offsetValue = trackingNode.getAttribute('offset');
            if (offsetValue.indexOf('%') == -1) {
                /* convert HH:MM:SS ( or HH:MM:SS.mmm) in seconds */
                trackingEvent.offsetInSeconds = new Date('1970-01-01T' + offsetValue + 'Z').getTime() / 1000;
            }
            else {
                trackingEvent.offsetPercent = offsetValue.substring(0, offsetValue.indexOf('%')) / 100;
            }
        }
        return trackingEvent;
    }

    private getVideoClicks (videoClicksNode): vast.VideoClicks {
        let videoClicks: vast.VideoClicks = new vast.VideoClicks(),
            nodeName,
            nodeValue;

        for (let i = 0; i < videoClicksNode.childNodes.length; i++) {
            nodeName = videoClicksNode.childNodes[i].nodeName;
            nodeValue = XmlDom.getNodeTextValue(videoClicksNode.childNodes[i]);

            switch (nodeName) {
                case 'ClickThrough':
                    videoClicks.clickThrough = nodeValue;
                    break;
                case 'ClickTracking':
                    videoClicks.clickTracking = nodeValue;
                    break;
                case 'CustomClick':
                    videoClicks.customClick = nodeValue;
                    break;
            }
        }

        return videoClicks;
    }

    private getMediaFile (mediaFileNode): vast.MediaFile {
        let mediaFile: vast.MediaFile = new vast.MediaFile();

        mediaFile.id = mediaFileNode.getAttribute('id');
        mediaFile.delivery = mediaFileNode.getAttribute('delivery');
        mediaFile.type = mediaFileNode.getAttribute('type');
        mediaFile.bitrate = mediaFileNode.getAttribute('bitrate');
        mediaFile.width = mediaFileNode.getAttribute('width');
        mediaFile.height = mediaFileNode.getAttribute('height');
        mediaFile.scalable = mediaFileNode.getAttribute('scalable');
        mediaFile.maintainAspectRatio = mediaFileNode.getAttribute('maintainAspectRatio');
        mediaFile.apiFramework = mediaFileNode.getAttribute('apiFramework');
        mediaFile.uri = XmlDom.getNodeTextValue(mediaFileNode);

        return mediaFile;
    }

    private getLinear (linearNode): vast.Linear {
        let linear: vast.Linear = new vast.Linear(),
            trackingNodes,
            videoClicksNode,
            mediaFileNodes;

        linear.duration = XmlDom.getChildNodeTextValue(linearNode, 'Duration');
        linear.adParameters = XmlDom.getChildNodeTextValue(linearNode, 'AdParameters');

        trackingNodes = XmlDom.getSubElements(linearNode, 'TrackingEvents', 'Tracking');
        for (let i = 0; i < trackingNodes.length; i++) {
            linear.trackingEvents.push(this.getTrackingEvent(trackingNodes[i]));
        }

        videoClicksNode = XmlDom.getElement(linearNode, 'VideoClicks');
        if (videoClicksNode) {
            linear.videoClicks = this.getVideoClicks(videoClicksNode);
        }

        mediaFileNodes = XmlDom.getSubElements(linearNode, 'MediaFiles', 'MediaFile');
        for (let i = 0; i < mediaFileNodes.length; i++) {
            linear.mediaFiles.push(this.getMediaFile(mediaFileNodes[i]));
        }

        return linear;
    }

    private getCreative (creativeNode): vast.Creative {
        let creative: vast.Creative = new vast.Creative(),
            linearNode;

        creative.id = creativeNode.getAttribute('id');
        creative.adId = creativeNode.getAttribute('AdID');
        creative.sequence = creativeNode.getAttribute('sequence');

        linearNode = XmlDom.getElement(creativeNode, 'Linear');
        if (linearNode) {
            creative.linear = this.getLinear(linearNode);
        }

        // TODO: get Companion and non-Linear elements

        return creative;
    }

    private getInLine (adNode): vast.InLine {
        let inLine: vast.InLine = new vast.InLine(),
            inLineNode = XmlDom.getElement(adNode, 'InLine'),
            impressionNodes,
            creativeNodes;

        if (inLineNode === null) {
            return null;
        }

        inLine.adSystem = XmlDom.getChildNodeTextValue(inLineNode, 'AdSystem');
        inLine.adTitle = XmlDom.getChildNodeTextValue(inLineNode, 'AdTitle');
        inLine.description = XmlDom.getChildNodeTextValue(inLineNode, 'Description');
        inLine.survey = XmlDom.getChildNodeTextValue(inLineNode, 'Survey');
        inLine.error = XmlDom.getChildNodeTextValue(inLineNode, 'Error');

        impressionNodes = XmlDom.getElements(inLineNode, 'Impression');
        for (let i = 0; i < impressionNodes.length; i++) {
            let impression = new vast.Impression();
            impression.id = impressionNodes[i].getAttribute('id');
            impression.uri = XmlDom.getNodeTextValue(impressionNodes[i]);
            inLine.impressions.push(impression);

        }

        creativeNodes = XmlDom.getSubElements(inLineNode, 'Creatives', 'Creative');
        for (let i = 0; i < creativeNodes.length; i++) {
            inLine.creatives.push(this.getCreative(creativeNodes[i]));
        }

        return inLine;
    }

    private getAd (adNode): vast.Ad {
        let ad: vast.Ad = new vast.Ad();
        ad.id = adNode.getAttribute('id');
        ad.sequence = adNode.getAttribute('sequence');
        ad.inLine = this.getInLine(adNode);
        return ad;
    }

    private getAds (vastNode, vast_: vast.Vast) {
        let adNodes = XmlDom.getElements(vastNode, 'Ad');
        for (let i = 0; i < adNodes.length; i++) {
            vast_.ads.push(this.getAd(adNodes[i]));
        }
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------  
}

export default VastParser;
