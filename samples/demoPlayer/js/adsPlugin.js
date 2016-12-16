/*
 * The copyright in this software module is being made available under the BSD License, included
 * below. This software module may be subject to other third party and/or contributor rights,
 * including patent rights, and no such rights are granted under this license.
 *
 * Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright notice, this list of conditions
 *   and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other materials provided
 *   with the distribution.
 * - Neither the name of VIACCESS S.A and/or ORCA Interactive nor the names of its contributors may
 *   be used to endorse or promote products derived from this software module without specific prior
 *   written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

class AdsPlugin {
    constructor(){
        this.adsPlayer = new adsplayer.AdsPlayer(document.getElementById('adsplayer-container'));
        this.adsPlayer.addEventListener('start', this.onAdsPlayerToggle.bind(this));
        this.adsPlayer.addEventListener('end', this.onAdsPlayerToggle.bind(this));
        this.adsPlayer.addEventListener('addElement', this.onAdsPlayerAddElement.bind(this));
        this.adsPlayer.addEventListener('removeElement', this.onAdsPlayerRemoveElement.bind(this));
        this.adsPlayer.addEventListener('play', this.onAdsPlayerPlayPause.bind(this));
        this.adsPlayer.addEventListener('pause', this.onAdsPlayerPlayPause.bind(this));
        this.adsPlayer.addEventListener('click', this.onAdsPlayerClick.bind(this));

        this.adsMode=false;

        document.getElementById('adsplayer_version').textContent+="  "+this.adsPlayer.getVersion();

    }

    onAdsPlayerToggle(e) {
        console.log("onAdsPlayerToggle - " + e.type);
        this.adsMode = (e.type === 'start');
        document.getElementById('videoplayer-container').style.display = this.adsMode ? 'none' : 'block';
    }

    onAdsPlayerPlayPause(e) {
        console.log("onAdsPlayerPlayPause - " + e.type);
        var play = (e.type === 'play');
        //handleAdsPlayerPlayState(play);
    }

    onAdsPlayerClick(e) {
        console.log("onAdsPlayerClick - " + e.type);
        if (e.data.uri) {
            window.open(e.data.uri);
        }
    }

    onAdsPlayerAddElement(e) {
        console.log("onAdsPlayerAddElement - " + e.type + " / " + e.data.type);
    }

    onAdsPlayerRemoveElement(e) {
        console.log("onAdsPlayerRemoveElement - " + e.type + " / " + e.data.type);
    }

    getPlugin(){
        return this.adsPlayer;
    }

    getAdsMode(){
        return this.adsMode;
    }
}
