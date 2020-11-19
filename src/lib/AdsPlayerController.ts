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
* AdsPlayerController is th main controller class for AdsPlayer module.
* It is in charge of downloading the MAST/VAST files and orchestrates the
* detection of triggers and playing of ad(s).
*/

import { Mast, Trigger } from './mast/model/Mast'
import { Config } from './Config';
import { Logger } from './Logger';
import { FileLoader } from './FileLoader';
import { ErrorHandler } from './ErrorHandler';
import { EventBus, AdEvents } from './EventBus';
import { MastParser } from './mast/MastParser';
import { TriggerManager } from './mast/TriggerManager';
import { VastParser } from './vast/VastParser';
import { VastPlayerManager } from './vast/VastPlayerManager';
import { Utils } from './utils/utils';
import { EventTypes } from '../Events';


export class AdsPlayerController {

    // #region MEMBERS
    // --------------------------------------------------

    private adsPlayerContainer: HTMLElement;
    private mainVideo: HTMLMediaElement;
    private mast: Mast;
    private fileLoaders: FileLoader[];
    private triggerManagers: TriggerManager[];
    private vastPlayerManager: VastPlayerManager;
    private mastParser: MastParser;
    private vastParser: VastParser;

    private config: Config;
    private logger: Logger;
    private eventBus: EventBus;
    private errorHandler: ErrorHandler;

    private onVideoPlayingListener;
    private onVideoTimeupdateListener;
    private onVideoEndedListener;
    private onTriggerEndListener;


    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor (eventBus: EventBus) {

        this.mainVideo = null;
        this.adsPlayerContainer = null;
        this.mast = null;
        this.fileLoaders = [];
        this.triggerManagers = [];
        this.vastPlayerManager = null;
        this.mastParser = new MastParser();
        this.vastParser = new VastParser();
        this.config = Config.getInstance();
        this.logger = Logger.getInstance();
        this.eventBus = eventBus;
        this.errorHandler = new ErrorHandler(eventBus);

        this.onVideoPlayingListener = this.onVideoPlaying.bind(this);
        this.onVideoTimeupdateListener = this.onVideoTimeupdate.bind(this);
        this.onVideoEndedListener = this.onVideoEnded.bind(this);
        this.onTriggerEndListener = this.onTriggerEnd.bind(this);
    }

    /**
     * Initialize the Ads Player Controller.
     * @method init
     * @access public
     * @memberof AdsPlayerController#
     * @param {Object} video - the HTML5 video element used by the main media player
     * @param {Object} adsPlayerContainer - The container to create the HTML5 video/image elements used to play and render the ads media
     */
    init (video: HTMLMediaElement, adsPlayerContainer: HTMLElement) {
        this.mainVideo = video;
        this.adsPlayerContainer = adsPlayerContainer;

        // Add <video> event listener
        this.mainVideo.addEventListener('playing', this.onVideoPlayingListener);
        this.mainVideo.addEventListener('timeupdate', this.onVideoTimeupdateListener);
        this.mainVideo.addEventListener('seeking', this.onVideoTimeupdateListener);
        this.mainVideo.addEventListener('ended', this.onVideoEndedListener);

        // Add trigger end event listener
        this.eventBus.addEventListener(AdEvents.TRIGGER_END, this.onTriggerEndListener);
    }


    /**
     * Load/open a MAST file.
     * @method load
     * @access public
     * @memberof AdsPlayerController#
     * @param {string} mastUrl - the MAST file url
     * @param {number} startTime - the playback time before which triggers shall be ignored
     */
    load (url: string, startTime?: number): Promise<boolean> {
        let fileLoader = new FileLoader();

        // Reset the MAST and trigger managers
        this.mast = null;
        this.triggerManagers = [];

        // Download and parse MAST file
        this.logger.debug('Download MAST file: ' + url);

        return new Promise((resolve, reject) => {
            fileLoader.load(url).then(result => {
                this.logger.debug('Parse MAST file');
                this.parseMastFile(result['dom'], result['baseUrl'], startTime);
                // Start managing triggers and ads playing
                resolve(this.start());
            }).catch(error => {
                if (error) {
                    this.errorHandler.sendError(error.name, error.data);
                    reject(error);
                } else {
                    resolve(false);
                }
            });
            this.fileLoaders.push(fileLoader);
        });
    }

    /**
     * Stops and resets the Ads player.
     * @method reset
     * @access public
     * @memberof AdsPlayerController#
     */
    stop () {
        this.logger.debug('Stop');

        // Stop/abort the file loaders
        for (let i = 0; i < this.fileLoaders.length; i++) {
            this.fileLoaders[i].abort();
        }
        this.fileLoaders = [];

        // Stop the VAST player manager
        if (this.vastPlayerManager) {
            this.vastPlayerManager.stop();
            this.vastPlayerManager = null;

            // Notifies the application ad(s) playback has ended
            // this.eventBus.dispatchEvent(EventTypes.END);
        }
    }

    reset () {
        this.logger.debug('Reset');

        this.stop();

        // Reset the trigger managers
        this.triggerManagers = [];

        // Reset the MAST
        this.mast = null;
    }

    destroy () {
        this.logger.debug('Destroy');

        this.reset();

        // Remove <video> event listener
        this.mainVideo.removeEventListener('playing', this.onVideoPlayingListener);
        this.mainVideo.removeEventListener('timeupdate', this.onVideoTimeupdateListener);
        this.mainVideo.removeEventListener('seeking', this.onVideoTimeupdateListener);
        this.mainVideo.removeEventListener('ended', this.onVideoEndedListener);

        // Remove trigger end event listener
        this.eventBus.removeEventListener('triggerEnd', this.onTriggerEndListener);
    }

    /**
     * Plays/resumes the playback of the current ad.
     * @method reset
     * @access public
     * @memberof AdsPlayerController#
     */
    play () {
        this.logger.debug('Play');

        // Start the VAST player manager
        if (this.vastPlayerManager) {
            this.vastPlayerManager.play();
        }
    }

    /**
     * Pauses the playback of the current ad.
     * @method reset
     * @access public
     * @memberof AdsPlayerController#
     */
    pause () {
        this.logger.debug('Pause');

        // Pause the VAST player manager
        if (this.vastPlayerManager) {
            this.vastPlayerManager.pause();
        }
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private loadVast (url: string) {
        let fileLoader = new FileLoader(),
            vast = null;

        return new Promise((resolve/*, reject*/) => {
            this.logger.debug('Download VAST file: ' + url);
            fileLoader.load(url).then(result => {
                    this.logger.debug('Parse VAST file');
                    vast = this.vastParser.parse(result['dom']);
                    vast.baseUrl = result['baseUrl'];
                    resolve(vast);
                }).catch(error => {
                    if (error) {
                        this.errorHandler.sendError(error.name, error.data);
                    }
                    resolve(null);
                }
            );
            this.fileLoaders.push(fileLoader);
        });
    }

    private loadTriggerVasts (trigger: Trigger) {
        let loadVastPromises = [];

        for (let i = 0; i < trigger.sources.length; i++) {
            let uri = trigger.sources[i].uri;
            // Check for relative uri path and add base url if needed
            uri = Utils.isAbsoluteURI(uri) ? uri : (this.mast.baseUrl + uri);
            loadVastPromises.push(this.loadVast(uri));
        }

        return new Promise((resolve, reject) => {
            Promise.all(loadVastPromises).then(vasts => {
                // Push vast objects in the trigger in the original order
                // (this = promises returned objects)
                for (let i = 0; i < vasts.length; i++) {
                    if (vasts[i] && vasts[i].ads && vasts[i].ads.length > 0) {
                        trigger.vasts.push(vasts[i]);
                    }
                }
                resolve();
            }).catch(() => {
                reject();
            });
        });
    }

    private parseMastFile (mastContent: Document, mastBaseUrl: string, startTime?: number) {
        let triggerManager;

        // Parse the MAST file
        this.mast = this.mastParser.parse(mastContent);

        if (!this.mast) {
            return;
        }

        // Store base URL for subsequent VAST files download
        this.mast.baseUrl = mastBaseUrl;

        // Filter the triggers
        if (this.config.filterTriggersFn) {
            try {
                this.mast.triggers = this.config.filterTriggersFn(this.mast.triggers);
            } catch (e) {
                this.logger.error('Failed to filter triggers');
            }
        }

        // Initialize the trigger managers
        for (let i = 0; i < this.mast.triggers.length; i++) {
            triggerManager = new TriggerManager();
            triggerManager.init(this.mast.triggers[i], startTime);
            this.triggerManagers.push(triggerManager);
        }
    }

    private onVideoPlaying () {
        if (this.config.handleMainPlayerPlayback && this.vastPlayerManager) {
            this.logger.debug('Pause main video');
            this.mainVideo.pause();
        }
    }

    private onVideoTimeupdate () {
        // Check for mid-roll triggers
        let trigger = this.checkTriggersStart();
        if (trigger !== null) {
            this.activateTrigger(trigger, true);
        }
    }

    private onVideoEnded () {
        // Check for end-roll triggers
        let trigger = this.checkTriggersStart();
        if (trigger !== null) {
            this.activateTrigger(trigger, true);
        }

        this.checkTriggersEnd();
    }

    private pauseVideo () {
        if (this.config.handleMainPlayerPlayback && this.mainVideo && !this.mainVideo.paused) {
            this.logger.debug('Pause main video');
            this.mainVideo.pause();
        }
    }

    private resumeVideo () {
        if (this.config.handleMainPlayerPlayback && this.mainVideo && this.mainVideo.paused) {
            this.logger.debug('Resume main video');
            this.mainVideo.play();
        }
    }

    private onTriggerEnd () {
        this.logger.debug('End playing trigger');

        // Delete VAST player manager
        if (this.vastPlayerManager) {
            this.vastPlayerManager = null;
        }

        // Check if another trigger has to be activated
        let trigger = this.checkTriggersStart();
        if (trigger !== null) {
            this.activateTrigger(trigger, false);
        } else {
            // Notifies the application ad(s) playback has ended
            this.eventBus.dispatchEvent(EventTypes.END);

            if (!this.mainVideo.ended) {
                // Resume the main video element
                this.resumeVideo();
            }
        }
    }

    private playTrigger (trigger: Trigger, firstTrigger: boolean) {
        if (trigger.vasts.length === 0) {
            this.onTriggerEnd();
            return;
        }

        // Pause the main video element
        this.pauseVideo();

        // Play the trigger
        this.logger.debug('Start playing trigger ' + trigger.id);
        this.vastPlayerManager = new VastPlayerManager(this.eventBus);
        this.vastPlayerManager.init(trigger.vasts, this.adsPlayerContainer, this.mainVideo);

        if (firstTrigger) {
            // Notifies the application ad(s) playback starts
            this.eventBus.dispatchEvent(EventTypes.START, {
                id: trigger.id,
                duration: this.vastPlayerManager.getVastsDuration(),
                currentTime: this.mainVideo.currentTime,
                ended: this.mainVideo.ended
            });
        }

        this.vastPlayerManager.start();
    }

    private activateTrigger (trigger: Trigger, firstTrigger: boolean) {

        // Check if a trigger is not already activated
        if (this.vastPlayerManager) {
            return;
        }

        this.logger.debug('Activate trigger ' + trigger.id);

        trigger.activated = true;

        if (trigger.vasts.length === 0) {
            // Download VAST files
            this.loadTriggerVasts(trigger).then(() => {
                this.playTrigger(trigger, firstTrigger);
            });
        } else {
            this.playTrigger(trigger, firstTrigger);
        }
    }

    private checkTriggersStart () {
        for (let i = 0; i < this.triggerManagers.length; i++) {
            if (this.triggerManagers[i].checkStartConditions(this.mainVideo)) {
                return this.triggerManagers[i].getTrigger();
            } else if (this.triggerManagers[i].getIsSkipped()) {
                // Remove triggers that are skipped since trigger time is anterior to provided stream start tileme
                this.triggerManagers.splice(0, 1);
                i--;
            }
        }
        return null;
    }

    private checkTriggersEnd () {
        for (let i = 0; i < this.triggerManagers.length; i++) {
            if (this.triggerManagers[i].checkEndConditions(this.mainVideo)) {
                // Remove trigger manager => will not be activated anymore
                this.triggerManagers.splice(0, 1);
                i--;
            }
        }
    }

    private start () {
        if (!this.mast) {
            return;
        }

        this.logger.debug('Start');

        if (this.mast.triggers.length === 0) {
            this.logger.warn('No trigger in MAST');
        }

        // Check for pre-roll trigger
        let trigger = this.checkTriggersStart();
        if (trigger !== null) {
            this.activateTrigger(trigger, true);
            return true;
        }

        return false;

    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------
}

export default AdsPlayerController;
