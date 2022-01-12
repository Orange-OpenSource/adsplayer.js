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
* The ImagePlayer is a MediaPlayer implementation for playing still images.
*/

import * as vast from '../vast/model/Vast'
import { MediaPlayer } from './MediaPlayer'
import { Logger } from '../Logger';
import { Utils } from '../utils/utils';


export class ImagePlayer implements MediaPlayer {

    // #region MEMBERS
    // --------------------------------------------------

    private uri: string;
    private image: HTMLElement;
    private duration: number;
    private currentTime: number;
    private ended: boolean;
    private listeners = {};
    private timerInterval;
    private timerTime;
    private events: string[];
    private logger: Logger;

    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
        this.uri = '';
        this.image = null;
        this.duration = 0;
        this.currentTime = 0;
        this.ended = false;
        this.listeners = {};
        this.timerInterval = null;
        this.timerTime = -1;
        this.events = ['play', 'pause', 'timeupdate', 'ended'];
        this.logger = Logger.getInstance();
    }

    load (baseUrl: string, mediaFiles: vast.MediaFile[]) {

        var mediaFile: vast.MediaFile = null;

        // Load the first supported image format
        // Support only jpeg, png and gif image formats
        for (let i = 0; i < mediaFiles.length; i++) {
            let type = mediaFiles[i].type;
            if ((type === 'image/jpeg') || (type === 'image/jpg') || (type === 'image/png') || (type === 'image/gif')) {
                mediaFile = mediaFiles[i];
                break;
            }
        }

        if (mediaFile === null) {
            return false;
        }

        // Get adsplayer-image element if already declared in DOM
        this.image = document.getElementById('adsplayer-image');

        if (!this.image) {
            // Create the image element
            this.image = document.createElement('img');
            this.image.id = 'adsplayer-image';
        }

        // Add base URL
        this.uri = mediaFile.uri;
        this.uri = Utils.isAbsoluteURI(this.uri) ? this.uri : (baseUrl + this.uri);

        this.logger.debug('Load image media, uri = ' + this.uri);
        this.image.setAttribute('src', this.uri);

        // Reset current time
        this.currentTime = 0;
        this.ended = false;

        return true;
    }

    getType () {
        return 'image';
    }

    getElement () {
        return this.image;
    }

    addEventListener (type: string, listener: any) {
        if (!this.image) {
            return;
        }
        if (this.events.indexOf(type) !== -1) {
            this.addEventListener_(type, listener);
        } else {
            this.image.addEventListener(type, listener);
        }
    }

    removeEventListener (type: string, listener: any) {
        if (!this.image) {
            return;
        }
        if (this.events.indexOf(type) !== -1) {
            this.removeEventListener_(type, listener);
        } else {
            this.image.removeEventListener(type, listener);
        }
    }

    setDuration (duration: number) {
        this.duration = duration;
    }

    getDuration (): number {
        return this.duration;
    }

    getCurrentTime (): number {
        return this.currentTime;
    }

    setVolume (volume: number) {
        // NA
    }

    getVolume () {
        return 0;
    }

    play (): Promise<void> {
        if (!this.image) {
            return;
        }
        this.startTimer();
        return Promise.resolve();
    }

    pause () {
        if (!this.image) {
            return;
        }
        this.stopTimer();
    }

    stop () {
        if (!this.image) {
            return;
        }
        this.stopTimer();
    }

    reset () {
        if (!this.image) {
            return;
        }
        this.image = null;
        this.listeners = {};
    }

    isEnded () {
        return this.ended;
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private getListeners (type) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        return this.listeners[type];
    }

    private addEventListener_ (type: string, listener: any) {
        let listeners = this.getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx === -1) {
            listeners.push(listener);
        }
    }

    private removeEventListener_ (type: string, listener: any) {
        let listeners = this.getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx !== -1) {
            listeners.splice(idx, 1);
        }
    }

    private notifyEvent (type) {
        let listeners = this.getListeners(type);

        for (let i = 0; i < listeners.length; i++) {
            listeners[i].call(this);
        }
    }

    private updateCurrentTime () {
        let time = new Date().getTime();

        this.currentTime += (time - this.timerTime) / 1000;
        //this.logger.log('Image timeupdate, time = ' + this.currentTime);
        this.notifyEvent('timeupdate');

        if (this.currentTime >= this.duration) {
            this.stopTimer();
            this.ended = true;
            this.notifyEvent('ended');
        }

        this.timerTime = time;
    }

    private startTimer () {
        if (this.timerInterval !== null) {
            return;
        }
        this.notifyEvent('play');
        this.timerTime = new Date().getTime();
        this.timerInterval = setInterval(this.updateCurrentTime.bind(this), 200);
    }

    private stopTimer () {
        if (this.timerInterval === null) {
            return;
        }
        this.notifyEvent('pause');
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    // #endregion PRIVATE FUNCTIONS
    // --------------------------------------------------    
}

export default ImagePlayer;
