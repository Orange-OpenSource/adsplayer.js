/**
* VAST parser. This class parses VAST file in XML format
* and construct the corresponding VAST object according to VAST data model.
*/
import * as vast from './model/Vast';
export declare class VastParser {
    constructor();
    /**
    * Parses the VAST XML DOM and get the triggers.
    * @param {object} xmlDom - the XML DOM to parse
    */
    parse(xmlDom: Document): vast.Vast;
    private getTrackingEvent;
    private getVideoClicks;
    private getMediaFile;
    private getLinear;
    private getCreative;
    private getInLine;
    private getAd;
    private getAds;
}
export default VastParser;
