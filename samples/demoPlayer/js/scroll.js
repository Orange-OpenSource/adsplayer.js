function pageload() {
	toBottom();
	var sec = document.getElementById('seconds').value;
	timedRefresh(sec * 1000);
	
}


function toBottom() {
	var bChecked = document.getElementById('gotobottom').checked;
	if (bChecked == true) {
		window.scrollTo(0, document.body.scrollHeight);
	} else {
		var prevScroll = document.getElementById('prevScroll').value;
		if (prevScroll != null) {
			window.scrollTo(0, prevScroll);
		}
	}
}

function timedRefresh(timeoutPeriod) {
	window.setTimeout("pagerefresh();",timeoutPeriod);
}

function pagerefresh() {
	document.getElementById('headerform').submit();
}


// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function currScrollPos() {
	//var obj = document.getElementById('content');
	document.getElementById('currScroll').value = window.pageYOffset;
	document.getElementById('maxScroll').value = document.body.scrollHeight;
	var curr = window.innerHeight + window.pageYOffset;
	if (curr >= document.getElementById('maxScroll').value) {
		document.getElementById('gotobottom').checked = true;
	} else {
		document.getElementById('gotobottom').checked = false;
	}
}

function logfileChanged() {
	document.getElementById('gotobottom').checked = true;
	document.forms['headerform'].submit();
}