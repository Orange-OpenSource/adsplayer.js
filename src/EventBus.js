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
* Event bus utility class for events listening and notifying.
*/

import Debug from './Debug';

let _instance = null;

class EventBus {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////


    _getListeners (type, useCapture) {
        if (useCapture === undefined) { // to provide a default parameter that works !!
            useCapture = false;
        }
        var captype = (useCapture ? '1' : '0') + type;

        if (!(captype in this._registrations)) {
            this._registrations[captype] = [];
        }

        return this._registrations[captype];
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    static getInstance() {
        if (_instance === null) {
            _instance = new EventBus();
        }

        return _instance;
    }

    constructor() {

        if (_instance !== null) {
            return _instance;
        }

        this._registrations = {};
        this._debug = Debug.getInstance();

        _instance = this;
        return _instance;
    }

    /**
     * [addEventListener description]
     * @param {[type]} type       [description]
     * @param {[type]} listener   [description]
     * @param {[type]} useCapture [description]
     */
    addEventListener (type, listener, useCapture) {
        var listeners = this._getListeners(type, useCapture),
            idx = listeners.indexOf(listener);

        if (idx === -1) {
            listeners.push(listener);
        }
    }

    /**
     * [removeEventListener description]
     * @param  {[type]} type       [description]
     * @param  {[type]} listener   [description]
     * @param  {[type]} useCapture [description]
     * @return {[type]}            [description]
     */
    removeEventListener (type, listener, useCapture) {
        var listeners = this._getListeners(type, useCapture),
            idx = listeners.indexOf(listener);

        if (idx !== -1) {
            listeners.splice(idx, 1);
        }
    }

    /**
     * [dispatchEvent description]
     * @param  {[type]} evt [description]
     * @return {[type]}     [description]
     */
    dispatchEvent (evt) {
        var listeners = this._getListeners(evt.type, false).slice(),
            i = 0;

        this._debug.log("# Event: " + evt.type);
        for (i = 0; i < listeners.length; i += 1) {
            listeners[i].call(this, evt);
        }
        return !evt.defaultPrevented;
    }
}

export default EventBus;