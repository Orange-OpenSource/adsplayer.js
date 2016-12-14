/**
 * Created by vobox on 9/28/16.
 */
class Ad {
    constructor(jsonAd){
        this.jsonAd = jsonAd;
    }

    /** Returns the ad's name of selected stream */
    getName() {
        return this.jsonAd.name;
    }

    /** Returns the ad's url */
    getUrl() {
        return this.jsonAd.url;
    }

}
