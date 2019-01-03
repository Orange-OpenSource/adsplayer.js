export declare class XmlDom {
    static getElementsByTagName: (node: XMLDocument, name: any) => NodeListOf<any>;
    static getElement: (node: any, name: any) => any;
    static getElements: (node: any, name: any) => any;
    static getSubElements: (node: any, name: any, subName: any) => any;
    static getChildNode: (node: any, name: any) => any;
    static getNodeTextValue: (node: any) => any;
    static getChildNodeTextValue: (node: any, name: any) => any;
}
