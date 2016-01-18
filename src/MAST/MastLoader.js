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
AdsPlayer.dependencies.MastLoader = function() {
    "use strict";
};

AdsPlayer.dependencies.MastLoader.prototype = {
    constructor: AdsPlayer.dependencies.MastLoader
};

AdsPlayer.dependencies.MastLoader.prototype.Load = function(url) {
    var deferred = Q.defer(),
        request = new XMLHttpRequest(),
        needFailureReport = true,
        onload = null,
        report = null,
        onabort = null;

    onabort = function() {
        request.aborted = true;
    };

    onload = function() {
        if (request.status < 200 || request.status > 299) {
            return;
        }

        if (request.status === 200 && request.readyState === 4) {
            console.log("[MastLoader] Mast downloaded");

            needFailureReport = false;

            deferred.resolve(request.responseText);
        }
    };

    report = function() {
        if (!needFailureReport) {
            return;
        }
        needFailureReport = false;

        if (request.aborted) {
            deferred.reject();
        } else {
            deferred.reject({
                name: "ERROR",
                message: "Failed to download mast file",
                data: {
                    url: url,
                    status: request.status
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
        request.send();
    } catch (e) {
        request.onerror();
    }
    return deferred.promise;
};