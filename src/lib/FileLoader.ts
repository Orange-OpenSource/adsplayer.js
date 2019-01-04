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

import { ErrorCodes } from '../Errors';

export class FileLoader {

    // #region MEMBERS
    // --------------------------------------------------

    private request: XMLHttpRequest;
    private url: string;
    private baseUrl: string;
    private aborted: boolean;
    private needFailureReport: boolean;

    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
        this.request = null;
        this.url = '';
        this.baseUrl = '';
        this.aborted = false;
        this.needFailureReport = true;
    }

    load (url): Promise<object> {
        return new Promise((resolve, reject) => {
            this.load_(url, resolve, reject);
        });
    }

    abort () {
        this.abort_();
    }

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private parseBaseUrl (url: string) {
        let base = null;
        if (url.indexOf('/') !== -1) {
            if (url.indexOf('?') !== -1) {
                url = url.substring(0, url.indexOf('?'));
            }
            base = url.substring(0, url.lastIndexOf('/') + 1);
        }
        return base;
    }

    private parseXml (data: string) {
        if (!DOMParser) {
            return null;
        }

        try {
            let parser = new DOMParser();

            let xmlDoc = parser.parseFromString(data, 'text/xml');
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('Error parsing XML');
            }
            return xmlDoc;
        } catch (e) {
            return null;
        }
    }

    private load_ (url: string, resolve: any, reject: any) {
        this.url = url;
        this.baseUrl = this.parseBaseUrl(url);
        this.request = new XMLHttpRequest();

        this.request.onload = evt => {
            this.onLoad(resolve, reject);
        };
        this.request.onloadend = evt => {
            this.onLoadend(resolve, reject);
        };
        this.request.onerror = evt => {
            this.onLoadend(resolve, reject);
        };
        this.request.onabort = evt => {
            this.onAbort();
        };

        this.request.open('GET', url, true);
        this.request.timeout = 10000;
        this.request.send();
    }

    private onAbort () {
        this.aborted = true;
    }

    private onLoad (resolve: any, reject: any) {
        if (this.request.status < 200 || this.request.status > 299) {
            return;
        }

        if (this.request.status === 200 && this.request.readyState === 4) {
            // Parse responseText in case of wrong response Content-Type
            let xmlDoc: Document = this.request.responseXML || this.parseXml(this.request.responseText);

            // Check if response is in XML format.
            if (xmlDoc === null) {
                this.needFailureReport = true;
                return;
            }

            // Get the redirection URL and use it as base URL
            if (this.request.responseURL) {
                this.baseUrl = this.parseBaseUrl(this.request.responseURL);
            }

            this.needFailureReport = false;

            // Return XML DOM (as input to parsers)
            resolve({
                dom: xmlDoc,
                baseUrl: this.baseUrl
            });

        }
    }

    private onLoadend (resolve: any, reject: any) {
        if (!this.needFailureReport) {
            return;
        }
        this.needFailureReport = false;

        if (this.aborted) {
            // Request has been aborted => reject without error
            reject();
        } else if (this.request.status < 200 || this.request.status > 299) {
            // Request has failed => reject with error
            reject({
                name: ErrorCodes.DOWNLOAD_ERR_FILE,
                data: {
                    url: this.url,
                    status: this.request.status
                }
            });
        } else if (this.request.responseXML === null) {
            // Response was not in XML format => reject with error
            reject({
                name: ErrorCodes.DOWNLOAD_ERR_NOT_XML,
                data: {
                    url: this.url
                }
            });
        }
    }

    private abort_ () {
        if (this.request !== null &&
            this.request.readyState > 0 &&
            this.request.readyState < 4) {
            this.request.abort();
        }
    }

    // #endregion PRIVATE FUNCTIONS
    // --------------------------------------------------
}
