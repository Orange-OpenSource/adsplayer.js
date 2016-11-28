/*
* The copyright in this software module is being made available under the BSD License, included
* below. This software module may be subject to other third party and/or contributor rights,
* including patent rights, and no such rights are granted under this license.
*
* Copyright (c) 2016, Orange
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted
* provided that the following conditions are met:
* - Redistributions of source code must retain the above copyright notice, this list of conditions
*   and the following disclaimer.
* - Redistributions in binary form must reproduce the above copyright notice, this list of
*   conditions and the following disclaimer in the documentation and/or other materials provided
*   with the distribution.
* - Neither the name of Orange nor the names of its contributors may be used to endorse or promote
*   products derived from this software module without specific prior written permission.
*
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
* IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
* FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER O
* CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
* WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
* WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var xmldom = {};

xmldom.getElementsByTagName = function(node, name) {
    var elements = node.getElementsByTagName(name);
    if (elements.length < 1) {
        var child = node.firstElementChild || node.firstChild;
        if (child) {
            var namespaceURI = child.namespaceURI;
            elements = node.getElementsByTagNameNS(namespaceURI, name);
        }
    }
    return elements;
};

xmldom.getElement = function(node, name) {
    var elements = this.getElementsByTagName(node, name);
    if (elements.length < 1) {
        return null;
    }
    return elements[0];
};

xmldom.getElements = function(node, name) {
    return this.getElementsByTagName(node, name);
};

xmldom.getSubElements = function(node, name, subName) {
    var element = this.getElement(node, name);
    if (element === null) {
        return [];
    }
    return this.getElements(element, subName);
};

xmldom.getChildNode = function (node, name) {
    if (!node || !node.childNodes) {
        return null;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeName === name) {
            return node.childNodes[i];
        }
    }
    return null;
};

xmldom.getNodeTextValue = function (node) {
    var cdataSection = this.getChildNode(node, '#cdata-section'),
        textSection = this.getChildNode(node, '#text');
    if (cdataSection) {
        return cdataSection.nodeValue;
    } else if (textSection) {
        return textSection.nodeValue;
    }
    return '';
};

xmldom.getChildNodeTextValue = function (node, name) {
    var element = this.getElement(node, name);
    if (element === null) {
        return '';
    }
    return this.getNodeTextValue(element);
};


export default xmldom;