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

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], function() {
            root.AdsPlayer = factory();
            return root.AdsPlayer;
        });
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.AdsPlayer = factory();
    }
})




(this, function() {
    'use strict';
    var AdsPlayer = {};
	
    AdsPlayer = function(playerElt) {
        var that = this,
            numberOfAdsToPlay = 0,
            internalPlayer = document.getElementById('adsPlayer'),
            overlay = document.getElementById('adsOverlay'),
            playingAds = false;

        this.player = playerElt;
        this.vastUrl = null;
        this.mastUrl = null;
        this.mastBaseUrl = null;
		this.listAds = [];		
		this.descripAds = [];
        that.numOfCues=0;                   // a counter on the number of cues still to play
        that.adsToPlay=[];                  // used to play several ads in a row , e.g with fast forward operation
        that.stillAdToplay = false;
	    that.currentCueIndex = null;        // what is the current Cue being played
        internalPlayer.autoplay = true;

        internalPlayer.addEventListener('click', function() {
		internalPlayer.vastTracker.click();
        });
 
        internalPlayer.addEventListener('timeupdate', function() {
            overlay.innerText = "Playing Ad: " + Math.round(internalPlayer.duration - internalPlayer.currentTime) + "s";
        });

        function _onFinished() {

            if(that.stillAdToplay)
            {
                that.playAd(that.currentCueIndex);
            }
            else{
                that.numOfCues--;
                internalPlayer.vastTracker.complete();
                console.log('ad completed or aborted');
                internalPlayer.pause();

               if(that.adsToPlay.length>0)  // if a subsequent ad is to be played, just do it
                    that.playAds();
                else {                         // no more ad to play
    			     internalPlayer.style.visibility = overlay.style.visibility = 'hidden';
    			     that.player.style.visibility = 'visible';
    			     overlay.innerText = "";
                     playingAds = false;
                     var event= new CustomEvent('endAd');
                    that.player.dispatchEvent(event); 
                }
            }
        };

        var setAdMode = function(enabled) {
            if (enabled) {
                that.player.style.visibility = 'hidden';
                internalPlayer.style.visibility = overlay.style.visibility = 'visible';
                internalPlayer.play();
            } else {
                that.player.style.visibility = 'visible';
                internalPlayer.style.visibility = overlay.style.visibility = 'hidden';
                overlay.innerText = "";
                internalPlayer.pause();
            }

            playingAds = enabled;
            internalPlayer.muted = !enabled;
        };
		
		this.getVast = function(urlvast, ind) {
					
			var url = urlvast;
			var indice = ind;
            if (url.indexOf('http://') === -1){
                url = that.mastBaseUrl + url;
            }
            var vastBaseUrl = url.match(/(.*)[\/\\]/)[1]||''+'/';
            vastBaseUrl=vastBaseUrl+'/';
            DMVAST.client.get(url, function(response) {
                if (response) {
                    var videoContainer = document.getElementById('VideoModule'),
                        adIdx,
                        adLen,
                        ad,
                        creaIdx,
                        creaLen,
                        creative,
                        mfIdx,
                        mfLen,
                        mediaFile,
                        fileURL;
                        var ads = [];
                        for (adIdx = 0, adLen = response.ads.length; adIdx < adLen; adIdx++) {
                            ad = response.ads[adIdx];
                            
                            for (creaIdx = 0, creaLen = ad.creatives.length; creaIdx < creaLen; creaIdx++) {
                                creative = ad.creatives[creaIdx];

                                if (creative.type === 'linear') {
                                    for (mfIdx = 0, mfLen = creative.mediaFiles.length; mfIdx < mfLen; mfIdx++) {
                                        mediaFile = creative.mediaFiles[mfIdx];
                                        
                                        if (mediaFile.fileURL.indexOf('http://') === -1){
                                            mediaFile.fileURL = vastBaseUrl+mediaFile.fileURL;
                                        }
                                    }
                                }
                            }
                        ads[adIdx] = {"ad":ad};
                        }
                    that.descripAds[indice] = {"listAds" : ads};
                    that.listAds[indice][3] = 0;                    // this is the number of ads played in the vast file;
                    that.listAds[indice][4] = response.ads.length;  // this is the number of ads to play in the vast file;
                    }
                });
        };


        this.start = function(mastUrl, vastUrl) {
            var vastData;
			that.mastUrl = mastUrl;
            that.vastUrl = vastUrl;
            that.listAds=[];
            if (that.mastUrl) {
                var mastClient = new AdsPlayer.dependencies.MastClient(that); that.mastBaseUrl = that.mastUrl.match(/(.*)[\/\\]/)[1]||'';
                that.mastBaseUrl=that.mastBaseUrl+'/';
                mastClient.start(that.mastUrl, that.player, that.mastListener);
			     console.log(that.listAds.ads);
            } else {
                that.listAds[that.listAds.length] = [that.vastUrl,0,0];
                that.getVast(that.listAds[0][0], 0);
                var event= new CustomEvent('mastCompleted');    
                that.player.dispatchEvent(event);           

            }
        };

        this._getBaseUri = function(url){
            var l = document.createElement('a');
            l.href = url;
            return l.protocol+'//'+l.host;
        };

        this.mastListener = function(e) {
            var ind=parseInt(e.target.text);
            if(that.listAds[ind][2]==0){
			     var event= new CustomEvent('playAd', { 'detail': e.target.text });	
			     that.player.dispatchEvent(event);
            }		
         };

		this.playAd = function(myInd) {
            if(typeof myInd === 'string'){
                var ind=parseInt(myInd);            // means that this is triggererd via a Cue
                  if(that.listAds[ind][2]==0){
                     that.adsToPlay=[ind];
                     ind=that.adsToPlay.shift();
                  }
            }
            else{
                var ind=myInd;
            }
            if(that.listAds[ind][2]==0){
                that.currentCueIndex=ind;
                var indAd=that.listAds[ind][3]++;
                console.log("will play add "+indAd+" of "+ind);
                that.stillAdToplay=(that.listAds[ind][3]<that.listAds[ind][4])?true:false;
                url = adsPlayer.descripAds[ind].listAds[indAd].ad.creatives[0].mediaFiles[0].fileURL; 
                // modify 25/03 
                var mediaDuration = that.descripAds[ind].listAds[indAd].ad.creatives[0].duration;
                var mediaMimType = that.descripAds[ind].listAds[indAd].ad.creatives[0].mediaFiles[0].mimeType;
                if (mediaMimType == "video/mp4") {
                    var ad = adsPlayer.descripAds[ind].listAds[indAd].ad;
                    var creative = ad.creatives[0];
                    var videoContainer = document.getElementById('VideoModule');
                    videoContainer.appendChild(internalPlayer);
                    videoContainer.appendChild(overlay);
                    setAdMode(true);
                    internalPlayer.src = url;
                    internalPlayer.vastTracker = new DMVAST.tracker(ad, creative);
                    internalPlayer.vastTracker.on('clickthrough', function() {
                    });
                    numberOfAdsToPlay++;
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
                    that.listAds[ind][2]=(that.listAds[ind][3]<that.listAds[ind][4])?0:1;
                }
                else if (mediaMimType.includes ("image/")) {
                    that.player.style.visibility = 'hidden';
                    that.player.pause();
                    setTimeout (function() {console.log('image !!');
                    that.player.style.visibility = 'visible';
                    that.player.play();}, mediaDuration * 1000);

                }
                // fin modify 25/03 
            }
		};

        this.setNumOfCues = function(){
            that.numOfCues=that.listAds.length;
        };

        this.playAds = function() {
            var ind=that.adsToPlay.shift();
            that.playAd(ind);
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
            that.numOfCues=0;
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

/*
        function added to play ads after a seek operation.
        Only unplayed ads will be played. This is indicated with the third parameter
        in listAds
*/
        this.seekedHandler=function(){
            var seekedTime=that.player.currentTime;
            console.log(seekedTime);

            for(var i=0;i<that.listAds.length;i++){
                if(that.listAds[i][1]>seekedTime){
                    break;
                }
                if(that.listAds[i][2]==0){
                  that.adsToPlay.push(i);
                }
            }
            if(that.adsToPlay.length>0)
                that.playAds();
        };
    };

    AdsPlayer.prototype = {
        constructor: AdsPlayer
    };

    AdsPlayer.dependencies = {};

    return AdsPlayer;
});