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

import { Logger } from './Logger';
import { EventTypes } from '../Events';


export enum AdEvents {
    TRIGGER_START = 'triggerStart',
    TRIGGER_END = 'triggerEnd',
    AD_START = 'adStart',
    AD_END = 'adEnd',
    PLAY = 'play',
    PAUSE = 'pause',
    CLICK = 'click'
}

export class EventBus {

    // #region MEMBERS
    // --------------------------------------------------

    private registrations: object;
    private logger: Logger;

    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    constructor() {
        this.registrations = {};
        this.logger = Logger.getInstance();
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------

    public addEventListener (type: string, listener: any) {
        let listeners = this.getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx === -1) {
            listeners.push(listener);
        }
    }

    public removeEventListener (type: string, listener: any) {
        let listeners = this.getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx !== -1) {
            listeners.splice(idx, 1);
        }
    }

    public removeAllEventListener () {
        this.registrations = {};
    }

    public dispatchEvent (type: string, data?: object) {
        let listeners = this.getListeners(type).slice(),
            event = {
                type: type,
                data: data ? data : {}
            }

        this.logger.debug('# Event: ' + type);
        for (let i = 0; i < listeners.length; i += 1) {
            listeners[i].call(this, event);
        }
    }

    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    private getListeners (type: string) {
        if (!(type in this.registrations)) {
            this.registrations[type] = [];
        }
        return this.registrations[type];
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------

}

// export default EventBus;
