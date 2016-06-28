/**
 * VAST parser. This class parses VAST file in XML format
 * and construct the corresponding VAST object according to VAST data model.
 */
AdsPlayer.vast.VastParser = function(vastBaseUrl) {
    "use strict";

    var _getTrackingEvent = function (trackingNode) {
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