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
/*jshint -W020 */
/*exported AdsPlayer*/
/*global DMVAST,MediaPlayer,Custom*/
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return root["AdsPlayer"] = factory();
        });
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root["AdsPlayer"] = factory();
    }
})(this, function() {
    var AdsPlayer = {};

    AdsPlayer = function(mastUrl, vastUrl, playerElt) {
        'use strict';

        var that = this,
            numberOfAdsToPlay = 0,
            internalPlayer = document.getElementById('adsPlayer'),
            overlay = document.getElementById('adsOverlay'),
            playingAds = false;

        this.player = playerElt;
        this.vastUrl = vastUrl;
        this.mastUrl = mastUrl;

        internalPlayer.autoplay = true;
        internalPlayer.addEventListener('click', function() {
            internalPlayer.vastTracker.click();
        });

        internalPlayer.addEventListener('timeupdate', function() {
            overlay.innerText = "Playing Ad: " + Math.round(internalPlayer.duration - internalPlayer.currentTime) + "s";
        });

        function _onFinished(args) {
            numberOfAdsToPlay--;
            internalPlayer.vastTracker.complete();
            setAdMode(false);
            playingAds = false;

        }

        var setAdMode = function(enabled) {
            if (enabled) {
                that.player.style.visibility = 'hidden';
                internalPlayer.style.visibility = overlay.style.visibility = 'visible';
                internalPlayer.play();
                that.player.pause();
            } else {
                that.player.style.visibility = 'visible';
                internalPlayer.style.visibility = overlay.style.visibility = 'hidden';
                overlay.innerText = "";
                internalPlayer.pause();
                that.player.play();
            }

            playingAds = enabled;
            internalPlayer.muted = !enabled;
        };

        this.getVast = function(url) {
            DMVAST.client.get(url, function(response) {
                    if (response) {
                        var videoContainer = document.getElementById('VideoModule');
                        videoContainer.appendChild(internalPlayer);
                        videoContainer.appendChild(overlay);

                        setAdMode(true);

                        for (var adIdx = 0, adLen = response.ads.length; adIdx < adLen; adIdx++) {
                            var ad = response.ads[adIdx];
                            for (var creaIdx = 0, creaLen = ad.creatives.length; creaIdx < creaLen; creaIdx++) {
                                var creative = ad.creatives[creaIdx];

                                if (creative.type === 'linear') {
                                    for (var mfIdx = 0, mfLen = creative.mediaFiles.length; mfIdx < mfLen; mfIdx++) {
                                        var mediaFile = creative.mediaFiles[mfIdx];
                                        if (mediaFile.mimeType !== 'video/mp4') {
                                            continue;
                                        }

                                        internalPlayer.vastTracker = new DMVAST.tracker(ad, creative);
                                        internalPlayer.vastTracker.on('clickthrough', function(url) {
                                            //var win = window.open(url, '_blank');
                                            //win.focus();
                                        });

                                        numberOfAdsToPlay++;
                                        internalPlayer.src = mediaFile.fileURL;
                                        playingAds = true;

                                        internalPlayer.addEventListener('canplay', function() {
                                            this.vastTracker.load();
                                        });
                                        internalPlayer.addEventListener('timeupdate', function() {
                                            this.vastTracker.setProgress(this.currentTime);
                                        });
                                        internalPlayer.addEventListener('play', function() {
                                            this.vastTracker.setPaused(false);
                                        });
                                        internalPlayer.addEventListener('pause', function() {
                                            this.vastTracker.setPaused(true);
                                        });
                                        internalPlayer.addEventListener("ended", _onFinished);
                                    }
                                }
                            }

                            if (internalPlayer.vastTracker) {
                                break;
                            } else {
                                // Inform ad server we can't find suitable media file for this ad
                                DMVAST.util.track(ad.errorURLTemplates, {
                                    ERRORCODE: 403
                                });
                            }
                        }
                    }

                    if (!internalPlayer.vastTracker) {
                        setAdMode(false);
                    }
                });

        };

        this.start = function() {
            if (that.mastUrl) {
               var mastClient = new AdsPlayer.dependencies.MastClient();
               mastClient.start(that.mastUrl, that.player, that.mastListener);
            } else {
                that.getVast(that.vastUrl);
            }
        };

        this.mastListener = function(e) {
            that.player.pause();
            that.getVast(e.target.text);
        };

        this.stop = function() {
            setAdMode(false);
        };

        this.playPause = function() {
            if (internalPlayer.paused) {
                internalPlayer.play();
            } else {
                internalPlayer.pause();
            }
        };

        this.reset = function() {
            that.player.style.visibility = 'visible';
            internalPlayer.style.visibility = overlay.style.visibility = 'hidden';
            overlay.innerText = "";
            internalPlayer.pause();
            playingAds = false;
        };

        this.isPlayingAds = function() {
            return playingAds;
        };

        this.mute = function() {
            internalPlayer.muted = !internalPlayer.muted;
            internalPlayer.vastTracker.setMuted(internalPlayer.muted);
        };

        this.setFullscreen = function(fullscreen) {
            internalPlayer.vastTracker.setFullscreen(fullscreen);
        };
    };

    AdsPlayer.prototype = {
        constructor: AdsPlayer
    };

    AdsPlayer.dependencies = {};

    return AdsPlayer;
});