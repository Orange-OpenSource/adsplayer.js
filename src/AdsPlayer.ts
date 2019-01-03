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

import { AdsPlayerController } from './lib/AdsPlayerController';
import { EventBus } from './lib/EventBus';
import { Logger } from './lib/Logger';
import { EventTypes } from './Events';

const NAME = 'AdsPlayer';
const VERSION = '';
const GIT_TAG = '@@REVISION';
const BUILD_DATE = '@@TIMESTAMP';


export class AdsPlayer {

    // #region MEMBERS
    // --------------------------------------------------

    private adsPlayerController: AdsPlayerController;
    private logger: Logger;
    private eventBus: EventBus;

    private error;
    private onErrorListener;


    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor () {
        this.adsPlayerController = null;
        this.eventBus = EventBus.getInstance();
        this.logger = Logger.getInstance();

        this.error = null;
        this.onErrorListener = this.onError.bind(this);
    }

    /**
    * Returns the plugin name.
    * @return {string} the plugin name
    */
    getName (): string {
        return NAME;
    }

    /**
    * Initializes the plugin.
    * @param {HTMLMediaElement} video - the main video player
    * @param {HTMLElement} adsPlayerContainer - the HTML element that will contains ad media element
    * @param {boolean} handleMainPlayerPlayback - true (by default) if AdsPlayer shall handle the main video playback state
    */
    init (video: HTMLMediaElement, adsPlayerContainer: HTMLElement, handleMainPlayerPlayback: boolean = true) {
        this.adsPlayerController = new AdsPlayerController();
        this.adsPlayerController.init(video, adsPlayerContainer, handleMainPlayerPlayback);
        this.eventBus.addEventListener(EventTypes.ERROR, this.onErrorListener);
    }

    /**
    * This method is invoked when a new stream is to be loaded/opened.
    * @param {object} stream - the stream contaning all stream informations (url, protData, adsUrl)
    */
    load (stream: object) {
        return new Promise((resolve, reject) => {
            if (stream.hasOwnProperty('adsUrl')) {
                this.adsPlayerController.load(stream['adsUrl']).then(function (res) {
                    resolve(res);
                }).catch(function (e) {
                    reject(e);
                });
            } else {
                resolve(false);
            }
        });
    }

    /**
    * This method is invoked when the current stream is to be stopped.
    */
    stop () {
        this.adsPlayerController.stop();
    }

    /**
    * This method is invoked when the player is to be reset.
    */
    reset () {
        this.adsPlayerController.reset();
    }

    /**
    * This method is invoked when this plugin is being removed/destroyed.
    */
    destroy () {
        this.adsPlayerController.destroy();
        this.eventBus.removeEventListener(EventTypes.ERROR, this.onErrorListener);
    }

    /**
    * Returns the plugin version.
    * @return {string} the plugin version
    */
    getVersion (): string {
        return VERSION;
    }

    /**
    * Returns the full plugin version, including git revision
    * @return {string} the full plugin version, including git revision
    */
    getVersionFull (): string {
        if (GIT_TAG.indexOf("@@") === -1) {
            return VERSION + '_' + GIT_TAG;
        } else {
            return VERSION;
        }
    }

    /**
    * Returns the build date.
    * @return {string} the build date
    */
    getBuildDate (): string {
        if (BUILD_DATE.indexOf("@@") === -1) {
            return BUILD_DATE;
        } else {
            return 'Not a builded version';
        }
    }

    /**
    * Plays/resumes the playback of the current ad.
    */
    play () {
        this.adsPlayerController.play();
    }

    /**
    * Pauses the playback of the current ad.
    */
    pause () {
        this.adsPlayerController.pause();
    }

    /**
    * Registers a listener on the specified event. See {@link Event} for the syntax of the events
    * and {@link EventTypes} for the types of event that can be raised.
    * @param {string} type - the event type for listen to
    * @param {callback} listener - the callback which is called when an event of the specified type occurs
    */
    addEventListener (type: string, listener: any) {
        this.eventBus.addEventListener(type, listener);
    }

    /**
    * Unregisters the listener previously registered with the addEventListener() method.
    * @param {string} type - the event type on which the listener was registered
    * @param {callback} listener - the callback which was registered to the event type
    */
    removeEventListener (type: string, listener: any) {
        this.eventBus.removeEventListener(type, listener);
    }

    /**
    * Returns the Error object for the most recent error.
    * @return {object} the Error object for the most recent error, or null if there has not been an error
    */
    getError () {
        return this.error;
    }

    /**
    * Enables or disables log messages.
    * @return {boolean} enable - true to enable log messages, false otherwise
    */
    enableLogs (enable) {
        this.logger.setLevel(enable? 4 : 0);
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private onError (e) {
        this.error = e.data;
    }
    
    // #endregion PRIVATE FUNCTIONS
    // --------------------------------------------------
}
