"use strict";

class XmlFileLoader{

    constructor(url,callback){
        this.xmlDom = null;
        this.callback = callback;
        this.url = url;
        this.xhttp = new XMLHttpRequest();
        this.loadXmlFile();

    }

    loadXmlFile(){
        this.xhttp.open("GET", this.url, true);
        this.xhttp.onreadystatechange = this.onreadystatechange.bind(this);
        this.xhttp.send();
    }

    onreadystatechange(){
        if (this.xhttp.readyState == 4 && ((this.xhttp.status == 200) || (this.xhttp.status == 0)) ) {
            console.log("loadXmlFile succeded");
            this.xmlDom = this.xhttp.responseXML;
            this.callback();
        } else console.log("loadXmlFile fails " + this.xhttp.readyState + " " + this.xhttp.status);
    }

    getXmlDom(){
        return this.xmlDom;
    }
}




