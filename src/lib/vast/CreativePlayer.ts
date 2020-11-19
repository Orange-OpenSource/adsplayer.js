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
* The CreativePlayer manages:
* - the playing of media files within a Creative (with the help of a Image/VideoPlayer)
* - the tracking events (with the help of a TrackingEventsManager)
* - the display of the ad skipping component
* - the user clicks
*/

import * as vast from './model/Vast';
import { TrackingEventsManager } from './TrackingEventsManager';
import { MediaPlayer } from '../media/MediaPlayer';
import { VideoPlayer } from '../media/VideoPlayer';
import { ImagePlayer } from '../media/ImagePlayer';
import { Logger } from '../Logger';
import { EventBus, AdEvents } from '../EventBus';
import { EventTypes } from '../../Events';
import { Utils } from '../utils/utils';

export class CreativePlayer {

    // #region MEMBERS
    // --------------------------------------------------

    private adPlayerContainer: HTMLElement;
    private mediaPlayer: MediaPlayer;
    private trackingEventsManager: TrackingEventsManager;
    private mainVideo: HTMLMediaElement;
    private logger: Logger;
    private eventBus: EventBus;

    private onMediaPlayListener;
    private onMediaPauseListener;
    private onMediaErrorListener;
    private onMediaTimeupdateListener;
    private onMediaEndedListener;


    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor(eventBus) {
        this.adPlayerContainer = null;
        this.mediaPlayer = null;
        this.trackingEventsManager = null;
        this.mainVideo = null;
        this.logger = Logger.getInstance();
        this.eventBus = eventBus;

        this.onMediaPlayListener = this.onMediaPlay.bind(this);
        this.onMediaPauseListener = this.onMediaPause.bind(this);
        this.onMediaErrorListener = this.onMediaError.bind(this);
        this.onMediaTimeupdateListener = this.onMediaTimeupdate.bind(this);
        this.onMediaEndedListener = this.onMediaEnded.bind(this);
    }

    /**
     * Initializes the creative player.
     * @method init
     * @access public
     * @memberof CreativePlayer#
     * @param {Object} creative - the creative element to play
     * @param {Object} adPlayerContainer - the HTML DOM container for ads player components
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {string} baseUrl - the base URL for media files
     */
    init (creative: vast.Linear, adPlayerContainer: HTMLElement, mainVideo: HTMLMediaElement, baseUrl: string) {
        this.adPlayerContainer = adPlayerContainer;
        this.mainVideo = mainVideo;
        return this.load(creative, baseUrl);
    }

    play () {
        this.play_();
    }

    pause () {
        this.pause_();
    }

    stop () {
        this.stop_();
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private onMediaPlay () {
        this.logger.debug('Creative media play');
        // Notify the creative has ended
        this.eventBus.dispatchEvent(EventTypes.PLAY);
    }

    private onMediaPause () {
        this.logger.debug('Creative media pause');
        // Notify the creative has ended
        this.eventBus.dispatchEvent(EventTypes.PAUSE);
    }

    private onMediaError () {
        this.logger.debug('Creative media error');
        // Notify the creative has ended
        this.eventBus.dispatchEvent(EventTypes.CREATIVE_END);
    }

    private onMediaEnded () {
        this.logger.debug('creative media ended');
        // Notify the creative has ended
        this.eventBus.dispatchEvent(EventTypes.CREATIVE_END);
    }

    private onMediaTimeupdate () {
        //this.logger.debug('Media timeupdate: ' + this.mediaPlayer.getCurrentTime());
        this.eventBus.dispatchEvent(EventTypes.TIMEUPDATE, {
            currentTime: this.mediaPlayer.getCurrentTime()
        });

    }

    private onMainVideoVolumeChange () {
        if (!this.mediaPlayer) {
            return;
        }
        this.mediaPlayer.setVolume(this.mainVideo.muted ? 0 : this.mainVideo.volume);
    }

    private onAdClick (creative: vast.Linear) {
        // this = creative player
        if (!creative.videoClicks) {
            return;
        }
        this.logger.debug('Creative Click');
        // ClickThrough : send an event for the application to open the web page
        if (creative.videoClicks.clickThrough) {
            this.logger.debug('Ad click, uri = ' + creative.videoClicks.clickThrough);
            this.eventBus.dispatchEvent(EventTypes.CLICK, {
                uri: creative.videoClicks.clickThrough
            });
        }

        // TODO
        // ClickTracking
        // if (this.videoClicks.clickTracking) {
        // }
    }

    private load (creative: vast.Linear, baseUrl: string) {
        var mediaFile,
            isVideo,
            isImage;

        if (!creative) {
            return false;
        }

        if (creative.mediaFiles.length === 0) {
            return false;
        }

        mediaFile = creative.mediaFiles[0];

        // Video or image media ?
        isVideo = mediaFile.type.indexOf('video') !== -1;
        isImage = mediaFile.type.indexOf('image') !== -1;

        if (isVideo) {
            this.mediaPlayer = new VideoPlayer();
        }
        else if (isImage) {
            this.mediaPlayer = new ImagePlayer();
        } else {
            // Unknown/unsupported media type
            return false;
        }

        // Load the media files
        this.logger.debug('Creative load');
        if (!this.mediaPlayer.load(baseUrl, creative.mediaFiles)) {
            this.mediaPlayer = null;
            return false;
        }

        this.mediaPlayer.setDuration(Utils.parseTime(creative.duration));
        this.mediaPlayer.addEventListener('play', this.onMediaPlayListener);
        this.mediaPlayer.addEventListener('pause', this.onMediaPauseListener);
        this.mediaPlayer.addEventListener('error', this.onMediaErrorListener);
        this.mediaPlayer.addEventListener('timeupdate', this.onMediaTimeupdateListener);
        this.mediaPlayer.addEventListener('ended', this.onMediaEndedListener);

        // Add tracking events
        if (creative.trackingEvents) {
            this.trackingEventsManager = new TrackingEventsManager();
            this.trackingEventsManager.init(creative.trackingEvents, this.mediaPlayer);
            this.trackingEventsManager.start();
        }

        // Notify a creative is starting to play
        this.eventBus.dispatchEvent(EventTypes.CREATIVE_START, {
            mediaType: isVideo ? 'video' : 'audio',
            duration: creative.duration,
            clickThroughUrl: (creative.videoClicks && creative.videoClicks.clickThrough) ? creative.videoClicks.clickThrough : undefined
        });

        // Notify a media element has been created and appended into document
        this.eventBus.dispatchEvent(EventTypes.ADD_ELEMENT, {
            element: this.mediaPlayer.getElement(),
            type: this.mediaPlayer.getType()
        });

        // Add the media player DOM element
        this.adPlayerContainer.appendChild(this.mediaPlayer.getElement());

        // Listener for click
        if (creative.videoClicks) {
            if (creative.videoClicks.clickThrough) {
                this.mediaPlayer.getElement().style.cursor = 'pointer';
            }
            this.mediaPlayer.getElement().addEventListener('click', this.onAdClick.bind(this, creative));
        }

        // Align media volume to main video volume, add 'volumechange' listener
        this.onMainVideoVolumeChange();
        this.mainVideo.addEventListener('volumechange', this.onMainVideoVolumeChange.bind(this));

        // Start playing the media
        this.play();

        return true;
    }

    private play_ () {

        if (!this.mediaPlayer) {
            return;
        }

        this.logger.debug('Creative play');

        // Play the media player
        this.mediaPlayer.play();
    }

    private pause_ () {

        if (!this.mediaPlayer) {
            return;
        }

        this.logger.debug('Creative pause');

        // Pause the media player
        this.mediaPlayer.pause();
    }

    private stop_ () {

        if (!this.mediaPlayer) {
            return;
        }

        this.logger.debug('Creative stop');

        // Stop listening for 'volumechange' event
        this.mainVideo.removeEventListener('volumechange', this.onMainVideoVolumeChange);
        this.mainVideo = null;

        // Stop the media player
        this.mediaPlayer.removeEventListener('play', this.onMediaPlayListener);
        this.mediaPlayer.removeEventListener('pause', this.onMediaPauseListener);
        this.mediaPlayer.removeEventListener('error', this.onMediaErrorListener);
        this.mediaPlayer.removeEventListener('timeupdate', this.onMediaTimeupdateListener);
        this.mediaPlayer.removeEventListener('ended', this.onMediaEndedListener);
        this.mediaPlayer.stop();

        // Notify a media element has been removed from DOM
        this.eventBus.dispatchEvent(EventTypes.REMOVE_ELEMENT, {
            element: this.mediaPlayer.getElement(),
            type: this.mediaPlayer.getType()
        });

        // Remove the element from the DOM
        this.adPlayerContainer.removeChild(this.mediaPlayer.getElement());

        // Stop the TrackingEvents manager
        if (this.trackingEventsManager) {
            this.trackingEventsManager.stop();
            this.trackingEventsManager = null;
        }

        // Reset the media player
        this.mediaPlayer.reset();
        this.mediaPlayer = null;
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------
}
