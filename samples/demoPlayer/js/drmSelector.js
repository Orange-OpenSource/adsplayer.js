/**
 * Created by vobox on 9/26/16.
 */
class DrmSelector {
    
	constructor(){
		
		var _self = this;
		
        _self.select = document.getElementById("licencerDrm");
    
		_self.select.addEventListener("change",function(e) {
            _self.onSelect(this);
        })
	
	}

    onSelect(element) {
        if(this.select.value === "com.microsoft.playready"){
			document.getElementById("customData").style.display = "block";
		}
		else{
			document.getElementById("customData").style.display = "none";
		}
    }
}