var adsplayer = require('../../dist/adsplayer.js');

var my_adsplayer = new adsplayer();

var node = document.createElement("div");                 
var textnode = document.createTextNode("AdsPlayer ModuleVersion = "+my_adsplayer.getVersion());
node.appendChild(textnode);                              
document.childNodes[0].appendChild(node); 
