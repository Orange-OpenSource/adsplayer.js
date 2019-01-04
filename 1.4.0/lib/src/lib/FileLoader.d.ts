export declare class FileLoader {
    private request;
    private url;
    private baseUrl;
    private aborted;
    private needFailureReport;
    constructor();
    load(url: any): Promise<object>;
    abort(): void;
    private parseBaseUrl;
    private parseXml;
    private load_;
    private onAbort;
    private onLoad;
    private onLoadend;
    private abort_;
}
