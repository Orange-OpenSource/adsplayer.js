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

    _getAd (vastNode, vast_) {
        let adNode = xmldom.getElement(vastNode, 'Ad');

        if (adNode === null) {
            return;
        }

        vast_.ad = new vast.Ad();
        vast_.ad.id = adNode.getAttribute('id');
        vast_.ad.inLine = this._getInLine(adNode);
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

        this._getAd(vastNode, vast_);

        return vast_;
    }
}

export default VastParser;
