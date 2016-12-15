/**
 * Created by vobox on 9/22/16.
 */
class StreamSelector {
    constructor(jsonStreamsDescription){
        this.customStream="";
        this.streams = JSON.parse(jsonStreamsDescription);
        if (!this.streams)
            throw "Can't parse streams";

        this.select = document.getElementById("stream_type");
        if (!this.select)
            throw "Can't find selector in DOM";

        for (var i = 0; i < this.streams.length; i++) {
            var option = document.createElement("option");
            option.text = this.streams[i].name;
            this.select.add(option);
        }
    }

    onSelect(element) {
        // update the document
        document.getElementById("stream").value = this.streams[this.select.selectedIndex].url;
        
		if(this.select.selectedIndex === 0){
			document.getElementById("licencer").style.display = "table-row";
		}
		else{
			document.getElementById("licencer").style.display = "none";
		}
    }

    getSelected() {
        if (this.streams[this.select.selectedIndex].name == "custom"){
            return new Stream({name : "custom", "url" : document.getElementById("stream").value});
        }
        else{
            return new Stream(this.streams[this.select.selectedIndex]);
        }
    }
}
