/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 * 
 * Copyright (c) 2016, Orange
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


// MediaFile object
adsplayer.vast.MediaFile = function () {
    "use strict";

    this.id = '';
    this.type = '';
    this.height = 0;
    this.width = 0;
};

adsplayer.vast.MediaFile.prototype = {
    constructor: adsplayer.vast.MediaFile
};

// VideoClick object
adsplayer.vast.VideoClick = function () {
    "use strict";

    this.clickThrough = '';
    this.clickTracking = '';
};

adsplayer.vast.VideoClick.prototype = {
    constructor: adsplayer.vast.VideoClick
};

// Linear object
adsplayer.vast.Linear = function () {
    "use strict";

    this.id = '';
    this.duration = 0;
};

adsplayer.vast.Linear.prototype = {
    constructor: adsplayer.vast.Linear
};

// Creative object
adsplayer.vast.Creative = function () {
    "use strict";

    this.id = '';
    this.sequence = 0;
    this.linear = null;
    this.companionAds = [];
    this.nonLinearAds = [];
};

adsplayer.vast.Creative.prototype = {
    constructor: adsplayer.vast.Creative
};

// Ad object
adsplayer.vast.Ad = function () {
    "use strict";

    this.system = '';
    this.title = '';
    this.description = '';
    this.creatives = [];
};

adsplayer.vast.Ad.prototype = {
    constructor: adsplayer.vast.Ad
};

