/**
* File downloader utility class.
*/

import ErrorHandler from './ErrorHandler';

class FileLoader {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _parseBaseUrl (url) {
        var base = null;

        if (url.indexOf("/") !== -1) {
            if (url.indexOf("?") !== -1) {
                url = url.substring(0, url.indexOf("?"));
            }
            base = url.substring(0, url.lastIndexOf("/") + 1);
        }

        return base;
    }

    _abort () {
        if (this._request !== null && this._request.readyState > 0 && this._request.readyState < 4) {
            this._request.abort();
        }
    }

    _load (url, resolve, reject) {
        let baseUrl = this._parseBaseUrl(url),
            needFailureReport = true,
            onload = null,
            report = null,
            onabort = null,
            self = this;

        onabort = function() {
            this.aborted = true;
        };

        onload = function() {
            if (this.status < 200 || this.status > 299) {
                return;
            }

            if (this.status === 200 && this.readyState === 4) {

                // Check if response is in XML format.
                if (this.responseXML === null) {
                    needFailureReport = true;
                    return;
                }

                // Get the redirection URL and use it as base URL
                if (this.responseURL) {
                    baseUrl = self._parseBaseUrl(this.responseURL);
                }

                needFailureReport = false;

                // Return XML DOM (as input to parsers)
                resolve({
                    response: this.responseXML,
                    baseUrl: baseUrl
                });

            }
        };

        report = function() {
            if (!needFailureReport) {
                return;
            }
            needFailureReport = false;

            if (this.aborted) {
                // Request has been aborted => reject without error
                reject();
            } else if (this.status < 200 || this.status > 299) {
                // Request has failed => reject with error
                reject({
                    name: ErrorHandler.DOWNLOAD_ERR_FILES,
                    message: "Failed to download file",
                    data: {
                        url: url,
                        status: this.status
                    }
                });
            } else if (this.responseXML === null) {
                // Response was not in XML format => reject with error
                reject({
                    name: ErrorHandler.DOWNLOAD_ERR_NOT_XML,
                    message: "The downloaded file format is not in xml format",
                    data: {
                        url: url
                    }
                });
            }
        };

        try {
            this._request = new XMLHttpRequest();
            this._request.onload = onload;
            this._request.onloadend = report;
            this._request.onerror = report;
            this._request.onabort = onabort;
            this._request.open("GET", url, true);
            this._request.timeout = 10000;
            this._request.send();
        } catch (e) {
            this._request.onerror();
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._request = null;
    }

    load (url) {
        return new Promise((resolve, reject) => {
            this._load(url, resolve, reject);
        });
    }

    abort () {
        if (this._request !== null &&
            this._request.readyState > 0 &&
            this._request.readyState < 4) {
            this._request.abort();
        }
    }
}

export default FileLoader;