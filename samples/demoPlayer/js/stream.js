/**
 * Created by vobox on 9/28/16.
 */
class Stream {
    constructor(jsonStream){
        this.jsonStream = jsonStream;
    }

    /** Returns the stream's name */
    getName() {
        return this.jsonStream.name;
    }

    /** Returns the stream's url */
    getUrl() {
        return this.jsonStream.url;
    }

    /** Returns the stream's number of licensers */
    getNumberOfLicensers() {
        if (this.jsonStream.licenser) {
            return this.jsonStream.licenser.length;
        } else { 
            return 0;
        }
    }

    /** Returns the stream's index ieme licenser drm type */
    /** drm type may be: com.widevine.alpha or com.microsoft.playready */
    getLicenserDrmType(index) {
        if (this.jsonStream.licenser) {
            return this.jsonStream.licenser[index].drm;
        } else {
            return "";
        }
    }

    /** Returns the stream's index ieme licenser url */
    getLicenserUrl(index) {
        if (this.jsonStream.licenser) {
            return this.jsonStream.licenser[index].url;
        } else {
            return "";
        }
    }
}
