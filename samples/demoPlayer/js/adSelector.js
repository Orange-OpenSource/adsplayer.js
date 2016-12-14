/**
 * Created by vobox on 9/26/16.
 */
class AdSelector {
    constructor(jsonAdsDescription){
        this.ads_data = JSON.parse(jsonAdsDescription);
        if (!this.ads_data)
            throw "Can't parse streams";

        this.select = document.getElementById("ad_type");
        if (!this.select)
            throw "Can't find selector in DOM";

        for (var i = 0; i < this.ads_data.length; i++) {
            var option = document.createElement("option");
            option.text = this.ads_data[i].name;
            this.select.add(option);
        }
    }

    onSelect(element) {

        if(element.value === "Custom"){
            document.getElementById("ad_url").disabled = "";
        }
        else{
            document.getElementById("ad_url").disabled = "disabled";
        }

        // update the document
        document.getElementById("ad_url").value = this.ads_data[this.select.selectedIndex].url;
    }

    getSelected() {

        if(this.select.value === "Custom"){
            return new Ad(
                {
                    name: "Custom",
                    url : document.getElementById("ad_url").value
                }
            );
        }
        else {
            return new Ad(this.ads_data[this.select.selectedIndex]);
        }
    }

    /** Returns the url of the stream */
    getUrl() {
        return this.ads_data[this.select.selectedIndex].url;
    }
}