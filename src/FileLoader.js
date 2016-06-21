/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Digital Primates
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
AdsPlayer.FileLoader = function() {
    "use strict";

    var deferred = null,
        request = null,

        _getDecodedResponseText = function(text) {
            var fixedCharCodes = '',
                i = 0,
                charCode;

            // Some content is not always successfully decoded by every browser.
            // Known problem case: UTF-16 BE manifests on Internet Explorer 11.
            // This function decodes any text that the browser failed to decode.
            if (text.length < 1) {
                return text;
            }

            // The troublesome bit here is that IE still strips off the BOM, despite incorrectly decoding the file.
            // So we will simply assume that the first character is < (0x3C) and detect its invalid decoding (0x3C00).
            if (text.charCodeAt(0) !== 0x3C00) {
                return text;
            }

            // We have a problem!
            for (i = 0; i < text.length; i += 1) {
                charCode = text.charCodeAt(i);

                // Swap around the two bytes that make up the character code.
                fixedCharCodes += String.fromCharCode(((charCode & 0xFF) << 8 | (charCode & 0xFF00) >> 8));
            }

            return fixedCharCodes;
        },

        _parseBaseUrl = function(url) {
            var base = null;

            if (url.indexOf("/") !== -1) {
                if (url.indexOf("?") !== -1) {
                    url = url.substring(0, url.indexOf("?"));
                }
                base = url.substring(0, url.lastIndexOf("/") + 1);
            }

            return base;
        },

        _abort = function() {
            if (request !== null && request.readyState > 0 && request.readyState < 4) {
                request.abort();
            }
        },

        _load = function(url) {
            var baseUrl = _parseBaseUrl(url),
                needFailureReport = true,
                onload = null,
                report = null,
                onabort = null,
                self = this;

            onabort = function() {
                request.aborted = true;
            };

            onload = function() {
                if (request.status < 200 || request.status > 299) {
                    return;
                }

                if (request.status === 200 && request.readyState === 4) {

                    // test if the file is in xml format.
                    if (request.responseXML === null) {
                        needFailureReport = true;
                        return;
                    }

                    // Get the redirection URL and use it as base URL
                    if (request.responseURL) {
                        baseUrl = _parseBaseUrl(request.responseURL);
                    }

                    needFailureReport = false;

                    // return XML DOM (as input to parsers)
                    deferred.resolve({
                        response: request.responseXML,
                        baseUrl: baseUrl
                    });

                }
            };

            report = function() {
                if (!needFailureReport) {
                    return;
                }
                needFailureReport = false;

                if (request.aborted) {
                    deferred.reject();
                } else if (request.status < 200 || request.status > 299) {
                    deferred.reject({
                        name: AdsPlayer.ErrorHandler.DOWNLOAD_ERR_FILES,
                        message: "Failed to download file",
                        data: {
                            url: url,
                            status: request.status
                        }
                    });
                } else if (request.responseXML === null) {
                    // status not useful
                    deferred.reject({
                        name: AdsPlayer.ErrorHandler.DOWNLOAD_ERR_NOTXML,
                        message: "the downloaded file format is not xml",
                        data: {
                            url: url
                        }
                    });
                }
            };

            try {
                request.onload = onload;
                request.onloadend = report;
                request.onerror = report;
                request.onabort = onabort;
                request.open("GET", url, true);
                request.timeout = 2000;
                request.send();
            } catch (e) {
                request.onerror();
            }
        };

    return {
        load: function(url) {
            deferred = Q.defer();
            request = new XMLHttpRequest();
            _load.call(this, url);
            return deferred.promise;
        },

        abort: _abort
    };
};

AdsPlayer.FileLoader.prototype = {
    constructor: AdsPlayer.utils.FileLoader
};