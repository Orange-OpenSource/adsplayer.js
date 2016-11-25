xmldom = {};


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