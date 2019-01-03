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
* The VideoPlayer is a MediaPlayer implementation for playing video files.
*/

import * as vast from '../vast/model/Vast'
import { MediaPlayer } from './MediaPlayer'
import { Logger } from '../Logger'
import { Utils } from '../utils/utils'


export class VideoPlayer implements MediaPlayer {

    // #region MEMBERS
    // --------------------------------------------------

    private uri: string;
    private video: HTMLMediaElement;
    private logger: Logger;

    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
        this.uri = '';
        this.video = null;
        this.logger = Logger.getInstance();
    }

    load (baseUrl: string, mediaFiles: vast.MediaFile[]) {

        // Get 'adsplayer-video' element if already declared in DOM
        this.video = document.getElementById('adsplayer-video') as HTMLMediaElement;

        if (!this.video) {
            // Create the video element
            this.video = document.createElement('video');
            this.video.autoplay = false;
            this.video.id = 'adsplayer-video';
        }

        // Check if input format is supported
        if (!this.isMediaSupported(mediaFiles[0].type)) {
            return false;
        }

        // Sort the mediafiles in bitrate ascending order
        mediaFiles.sort(function(a, b) {
            if (a.bitrate && b.bitrate) {
                return a.bitrate - b.bitrate;
            }
            return -1;
        });

        // Play the media file with lowest bitrate
        this.uri = mediaFiles[0].uri;

        // Add base URL
        this.uri = Utils.isAbsoluteURI(this.uri) ? this.uri : (baseUrl + this.uri);

        this.logger.debug('Load video media, uri = ' + this.uri);

        this.video.addEventListener('error', function(e) {
            console.log(e);
        });

        this.video.src = this.uri;

        return true;
    }

    getType () {
        return 'video';
    }

    getElement () {
        return this.video;
    }

    addEventListener (type: string, listener: any) {
        if (!this.video) {
            return;
        }
        this.video.addEventListener(type, listener);
    }

    removeEventListener (type: string, listener: any) {
        if (!this.video) {
            return;
        }
        this.video.removeEventListener(type, listener);
    }

    setDuration (duration: number) {
        // duration is handled by the video element
    }

    getDuration (): number {
        if (!this.video) {
            return 0;
        }
        return this.video.duration;
    }

    getCurrentTime (): number {
        if (!this.video) {
            return 0;
        }
        return this.video.currentTime;
    }

    getVolume (): number {
        if (!this.video) {
            return 0;
        }
        return this.video.muted ? 0 : this.video.volume;
    }

    setVolume (volume: number) {
        if (!this.video) {
            return;
        }
        this.video.volume = volume;
    }

    play () {
        if (!this.video) {
            return;
        }
        this.video.play();
    }

    stop () {
        if (!this.video) {
            return;
        }
        this.video.pause();
        this.video.removeAttribute('src');
        this.video.load();
    }

    pause () {
        if (!this.video) {
            return;
        }
        this.video.pause();
    }

    reset () {
        if (!this.video) {
            return;
        }
        this.video = null;
    }

    isEnded () {
        return this.video.ended;
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------    

    private isMediaSupported (mimeType) {
        if (!this.video) {
            throw 'isMediaSupported(): element not created';
        }
        if (!(this.video instanceof HTMLMediaElement)) {
            throw 'isMediaSupported(): element must be of type HTMLMediaElement';
        }

        var canPlay = this.video.canPlayType(mimeType);
        return (canPlay === 'probably' || canPlay === 'maybe');
    }

    // #endregion PRIVATE FUNCTIONS
    // --------------------------------------------------    


}

export default VideoPlayer;
