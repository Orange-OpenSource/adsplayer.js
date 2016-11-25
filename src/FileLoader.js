/**
 * File downloader utility class.
 */
 AdsPlayer.FileLoader = function() {
    "use strict";

    var deferred = null,
        request = null,

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

        _parseXml = function(data) {

            if (!window.DOMParser) {
                return null;
            }

            try {
                var parser = new window.DOMParser();

                var xmlDoc = parser.parseFromString(data, "text/xml");
                if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                    throw new Error('Error parsing XML');
                }
                return xmlDoc;
            } catch (e) {
                return null;
            }
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

                    // Parse responseText in case of wrong response Content-Type
                    var xmlDoc = request.responseXML || _parseXml(request.responseText);

                    if (xmlDoc === null) {
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
                request.timeout = 10000;
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