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

    _parseXml (data) {

        if (!window.DOMParser) {
            return null;
        }

        try {
            let parser = new window.DOMParser();

            let xmlDoc = parser.parseFromString(data, "text/xml");
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('Error parsing XML');
            }
            return xmlDoc;
        } catch (e) {
            return null;
        }
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

                // Parse responseText in case of wrong response Content-Type
                let xmlDoc = this.responseXML || self._parseXml(this.responseText);

                // Check if response is in XML format.
                if (xmlDoc === null) {
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
                    response: xmlDoc,
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