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
* AdsPlayer.
* @constructor AdsPlayer
* @param {Object} adsPlayerContainer - the DOM container in which &lt;video&gt; and &lt;img&gt; HTML components will be appended
*/

import AdsPlayerController from './AdsPlayerController';
import EventBus from './EventBus';
import Debug from './Debug';

const NAME = 'AdsPlayer';
const VERSION = '@@VERSION';
const GIT_TAG = '@@GITTAG';
const GIT_REVISION = '@@REVISION';
const BUILD_DATE = '@@TIMESTAMP';

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

function _onError (e) {
    this._error = e.data;
}

function _onWarning (e) {
    this._warning = e.data;
}

class AdsPlayer {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor (adsPlayerContainer) {

        this._adsPlayerContainer = adsPlayerContainer;
        this._error = null;
        this._warning = null;
        this._eventBus = EventBus.getInstance();
        this._debug = Debug.getInstance();
        this._adsPlayerController = null;

        this.onErrorListener = _onError.bind(this);
        this.onWarningListener = _onWarning.bind(this);
    }

    // Plugin API

    /**
    * [Plugin API, invoked by hasplayer.js]
    * Returns the plugin name.
    * @method getName
    * @access public
    * @memberof AdsPlayer#
    * @return {string} the plugin name
    */
    getName () {
        return NAME;
    }

    /**
    * [Plugin API, invoked by hasplayer.js]
    * Initializes the plugin.
    * @method init
    * @access public
    * @memberof AdsPlayer#
    * @param {Object} player - the MediaPlayer
    * @param {function} callback - the callback function to invoke when initialization is done
    */
    init (player, callback) {
        this._adsPlayerController = new AdsPlayerController();
        this._adsPlayerController.init(player, this._adsPlayerContainer);
        this._eventBus.addEventListener('error', this.onErrorListener);
        this._eventBus.addEventListener('warning', this.onWarningListener);

        callback();
    }

    /**
    * [Plugin API, invoked by hasplayer.js]
    * This method is invoked when a new stream is to be loaded/opened.
    * @method load
    * @access public
    * @memberof AdsPlayer#
    * @param {object} stream - the stream contaning all stream informations (url, protData, adsUrl)
    */
    load (stream, callback) {
        this._debug.log("(AdsPlayer) load: " + stream.adsUrl);
        if (stream.adsUrl) {
            this._adsPlayerController.load(stream.adsUrl).then(function () {
                callback();
            }).catch(function () {
                callback();
            });
        } else {
            callback();
        }
    }

    /**
    * [Plugin API, invoked by hasplayer.js]
    * This method is invoked when the current stream is to be stopped.
    * @method stop
    * @access public
    * @memberof AdsPlayer#
    */
    stop () {
        this._debug.log("(AdsPlayer) stop");
        this._adsPlayerController.stop();
    }

    /**
    * [Plugin API, invoked by hasplayer.js]
    * This method is invoked when the player is to be reset.
    * @method reset
    * @access public
    * @memberof AdsPlayer#
    */
    reset () {
        this._debug.log("(AdsPlayer) reset");
        this._adsPlayerController.reset();
    }

    /**
    * [Plugin API, invoked by hasplayer.js]
    * This method is invoked when this plugin is being removed/destroyed.
    * @method destroy
    * @access public
    * @memberof AdsPlayer#
    */
    destroy () {
        this._debug.log("(AdsPlayer) destroy");
        this._adsPlayerController.destroy();
        this._eventBus.removeEventListener('error', this.onErrorListener);
        this._eventBus.removeEventListener('warning', this.onWarningListener);
    }

    // AdsPlayer additionnal API

    /**
    * Returns the plugin version.
    * @method getVersion
    * @access public
    * @memberof AdsPlayer#
    * @return {string} the plugin version
    */
    getVersion () {
        return GIT_TAG+' (from '+NAME+' '+VERSION+')';
    }

    /**
    * Returns the full plugin version, including git revision
    * @access public
    * @memberof AdsPlayer#
    * @return {string} the full plugin version, including git revision
    */
    getVersionFull  () {
        if (GIT_REVISION.indexOf("@@") === -1) {
            return VERSION + '_' + GIT_REVISION;
        } else {
            return VERSION;
        }
    }

    /**
    * Returns the build date.
    * @method getBuildDate
    * @access public
    * @memberof AdsPlayer#
    * @return {string} the build date
    */
    getBuildDate () {
        if (BUILD_DATE.indexOf("@@") === -1) {
            return BUILD_DATE;
        } else {
            return 'Not a builded version';
        }
    }

    /**
    * Plays/resumes the playback of the current ad.
    * @method play
    * @access public
    * @memberof AdsPlayer#
    */
    play () {
        this._debug.log("(AdsPlayer) play");
        this._adsPlayerController.play();
    }

    /**
    * Pauses the playback of the current ad.
    * @method pause
    * @access public
    * @memberof AdsPlayer#
    */
    pause () {
        this._debug.log("(AdsPlayer) pause");
        this._adsPlayerController.pause();
    }

    /**
    * Registers a listener on the specified event.
    * The possible event types are:
    * <li>'error' (see [error]{@link AdsPlayer#event:error} event specification)
    * <li>'warning' (see [warning]{@link AdsPlayer#event:warning} event specification)
    * <li>'start' (see [start]{@link AdsPlayer#event:start} event specification)
    * <li>'end' (see [end]{@link AdsPlayer#event:end} event specification)
    * <li>'click' (see [click]{@link AdsPlayer#event:click} event specification)
    * @method addEventListener
    * @access public
    * @memberof AdsPlayer#
    * @param {string} type - the event type for listen to
    * @param {callback} listener - the callback which is called when an event of the specified type occurs
    * @param {boolean} useCapture - see HTML DOM addEventListener() method specification
    */
    addEventListener (type, listener, useCapture) {
        this._eventBus.addEventListener(type, listener, useCapture);
    }

    /**
    * Unregisters the listener previously registered with the addEventListener() method.
    * @method removeEventListener
    * @access public
    * @memberof AdsPlayer#
    * @see [addEventListener]{@link AdsPlayer#addEventListener}
    * @param {string} type - the event type on which the listener was registered
    * @param {callback} listener - the callback which was registered to the event type
    */
    removeEventListener (type, listener) {
        this._eventBus.removeEventListener(type, listener);
    }

    /**
    * Returns the Error object for the most recent error.
    * @access public
    * @memberof AdsPlayer#
    * @return {object} the Error object for the most recent error, or null if there has not been an error
    */
    getError () {
        return this._error;
    }

    /**
    * Returns the Warning object for the most recent warning.
    * @access public
    * @memberof AdsPlayer#
    * @return {object} the Warning object for the most recent warning, or null if there has not been a warning
    */
    getWarning () {
        return this._warning;
    }
}

// /**
//  * @class
//  * @classdesc AdsPlayer
//  */
// AdsPlayer.prototype = {
//     constructor: AdsPlayer
// };

// AdsPlayer.mast = {};
// AdsPlayer.mast.model = {};
// AdsPlayer.mast.model.Trigger = {};
// AdsPlayer.mast.model.Trigger.Condition = {};
// AdsPlayer.vast = {};
// AdsPlayer.vast.model = {};
// AdsPlayer.vast.model.Vast = {};
// AdsPlayer.media = {};
// AdsPlayer.utils = {};



/////////// EVENTS

/**
* The 'start' event is fired when the playback of ad(s) is starting.
* When the 'start' event is fired, the application shall hide the main player component and
* display the ads player container in which the ad media player component(s) will be created
* and displayed.
*
* @event AdsPlayer#start
* @param {object} event - the event
* @param {object} event.type - the event type ('start')
*/

/**
* The 'end' event is fired when the playback of ad(s) has ended.
* When the 'end' event is fired, the application shall display the main player component and
* hide the ads player container.
*
* @event AdsPlayer#end
* @param {object} event - the event
* @param {object} event.type - the event type ('end')
*/

/**
* The 'addElement' event is fired when a DOM element for playing an ad has been created
* and will be appended in the ads player container.
* The element can be either a &lt;video&gt; or an &lt;img&gt; element.
*
* @event AdsPlayer#addElement
* @param {object} event - the event
* @param {object} event.type - the event type ('addElement')
* @param {object} event.data - the event data
* @param {string} event.data.element - the created element
* @param {string} event.data.type - the type of the element, 'video' for &lt;video&gt; or 'image' for &lt;img&gt;
*/

/**
* The 'removeElement' event is fired when the DOM element for playing an ad is being removed
* from the ads player container and deleted.
*
* @event AdsPlayer#removeElement
* @param {object} event - the event
* @param {object} event.type - the event type ('removeElement')
* @param {object} event.data - the event data
* @param {string} event.data.element - the created element
* @param {string} event.data.type - the type of the element, 'video' for &lt;video&gt; or 'image' for &lt;img&gt;
*/

/**
* The 'play' event is fired when the playback of media ad is starting.
*
* @event AdsPlayer#play
* @param {object} event - the event
* @param {object} event.type - the event type ('play')
*/

/**
* The 'pause' event is fired when the playback of an ad is paused.
*
* @event AdsPlayer#pause
* @param {object} event - the event
* @param {object} event.type - the event type ('pause')
*/

/**
* The 'click' event is fired when a click has been performed on the ad component.
* When the 'click' event is fired, the application shall open the web page with the provided URI.
*
* @event AdsPlayer#click
* @param {object} event - the event
* @param {object} event.type - the event type ('click')
* @param {object} event.data - the event data
* @param {string} event.data.uri - the web page uri
*/

/**
* The error event is fired when an error occurs.
* When the error event is fired, the application shall stop the player.
*
* @event AdsPlayer#error
* @param {object} event - the event
* @param {object} event.type - the event type ('error')
* @param {object} event.data - the event data
* @param {string} event.data.code - error code
* @param {string} event.data.message - error message
* @param {object} event.data.data - error additionnal data
*/

/**
* The warning event is fired when a warning occurs.
*
* @event AdsPlayer#warning
* @param {object} event - the event
* @param {object} event.type - the event type ('warning')
* @param {object} event.data - the event data
* @param {string} event.data.code - warning code
* @param {string} event.data.message - warning message
* @param {object} event.data.data - warning additionnal data
*/

export default AdsPlayer;