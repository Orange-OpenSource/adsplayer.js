/*
 * The copyright in this software module is being made available under the BSD License, included below. This software module may be subject to other third party and/or contributor rights, including patent rights, and no such rights are granted under this license.
 * The whole software resulting from the execution of this software module together with its external dependent software modules from dash.js project may be subject to Orange and/or other third party rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2014, Orange
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Orange nor the names of its contributors may be used to endorse or promote products derived from this software module without specific prior written permission.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

AdsPlayer.AdsMediaPlayer = function() {

    var self = this,
        overlay = null,
        playingAds = false,
        adsVideoPlayer = null,
        adsImageNode = null,
        _medias = [],
        _videoUrl = '',
        _adsContainer = null,
        _eventBus = _EventBus.getInstance(),


        // functions
        _isPlayingAds = function() {
            return playingAds;
        },

        _init = function(adsContainer) {
            _adsContainer = adsContainer;
            _createVideoElt();
            _createImageElt();
        },

        _createVideoElt = function() {
            if (adsVideoPlayer === null) {
                adsVideoPlayer = document.createElement('video');
                adsVideoPlayer.autoplay = false;
                adsVideoPlayer.id = 'adsVideoPlayer';
                adsVideoPlayer.style.position = 'absolute';
                adsVideoPlayer.style.top = 0;
                adsVideoPlayer.style.left = 0;
                adsVideoPlayer.style.width = '100%';
                _adsContainer.appendChild(adsVideoPlayer);
                adsVideoPlayer.addEventListener("ended", function(){
                    _eventBus.dispatchEvent({type:"adEnded",data :{}});
                });
            }
        },

        _createImageElt = function() {
            if (adsImageNode  === null) {
                adsImageNode = document.createElement('img');
                adsImageNode.autoplay = false;
                adsImageNode.id = 'adsImageNode';
                adsImageNode.style.position = 'absolute';
                adsImageNode.style.top = 0;
                adsImageNode.style.left = 0;
                adsImageNode.visibility = "hidden";
                //adsImageNode.style.width = '100%';
                _adsContainer.appendChild(adsImageNode);
            }
        },

        _addlistener = function(type, listener) {
            adsVideoPlayer.addEventListener(type, listener);
        },

        _isLoaded = function() {
            adsVideoPlayer.play();
            console.log('Play ad : ' + _videoUrl);
            adsVideoPlayer.removeEventListener("loadeddata", _isLoaded);
        },

        _onError = function(e) {
            var error = e.data;
            if (_medias.length) {
                _playMedia();
            } else {
                adsVideoPlayer.removeEventListener("error", _onError);
                var event = new CustomEvent('aborted');
                adsVideoPlayer.dispatchEvent(event);
            }
        },

        _onVideoClick = function () {
            var url = _medias.clickThrough;
            if (url) {
                try{
                    window.open(url,"Ads Windows");
                }
                catch (e)
                {
                    throw(e);
                }
            }
        },

        _supportedMedia = function (element, codec) {
            "use strict";

            if (!(element instanceof HTMLMediaElement)) {
                throw "element must be of type HTMLMediaElement.";
            }

            var canPlay = element.canPlayType(codec);
            return (canPlay === "probably" || canPlay === "maybe");
        },

        _playMedia = function() {
            if (_medias.length) {
               var time = _medias.duration;
                var media = _medias.shift();

                if ((media.type === "image/jpeg") || (media.type === "image/jpg")) {
                    adsImageNode.visibility = "visible";

                    adsImageNode.src = media.uri;
                    setTimeout(function(){
                        adsImageNode.src = '';
                        adsImageNode.visibility = "hidden";
                        _eventBus.dispatchEvent({type:"adEnded",data :{}});
                    }, time*1000);

                      //  adsVideoPlayer.load(); // to do
                } else {
                    if (_supportedMedia(adsVideoPlayer, media.type)) {
                        adsVideoPlayer.src = media.uri;
                        adsVideoPlayer.type = media.type;
                        adsVideoPlayer.load();
                    } else {

                        _playMedia();
                    }
                }
            } else {
                var event = new CustomEvent('aborted');
                adsVideoPlayer.dispatchEvent(event);
            }

        },

    _playVideo = function(medias) {
        _medias = medias;
        adsVideoPlayer.addEventListener("loadeddata", _isLoaded);
        adsVideoPlayer.addEventListener("error", _onError);
        adsVideoPlayer.addEventListener("click", _onVideoClick);
        adsImageNode.addEventListener("click", _onVideoClick);
        _playMedia();
    };

    _show = function(show) {
        if (adsVideoPlayer) {
            adsVideoPlayer.style.visibility = show ? 'visible' : 'hidden';
        }
    };

    return {
        init: _init,
        isPlayingAds: _isPlayingAds,
        createVideoElt: _createVideoElt,
        playVideo: _playVideo,
        addlistener: _addlistener,
        show: _show,
        createImageElt: _createImageElt
    };
};

AdsPlayer.AdsMediaPlayer.prototype = {
    constructor: AdsPlayer.AdsMediaPlayer
};