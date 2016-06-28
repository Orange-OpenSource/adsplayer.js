/**
 * File downloader utility class.
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
                        name: AdsPlayer.ErrorHandler.DOWNLOAD_ERR_NOT_XML,
                        message: "The downloaded file format is not in xml format",
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