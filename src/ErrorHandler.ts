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
* Errors and warning notifications handler.
*/

import { Logger } from './Logger';
import { EventBus } from './EventBus';


export enum ERROR {
    DOWNLOAD_ERR_FILES = 'DOWNLOAD_ERR_FILES',
    DOWNLOAD_ERR_NOT_XML = 'DOWNLOAD_ERR_NOT_XML',
    LOAD_VAST_FAILED = 'LOAD_VAST_FAILED',
    NO_VALID_MEDIA_FOUND = 'NO_VALID_MEDIA_FOUND',
    LOAD_MEDIA_FAILED = 'LOAD_MEDIA_FAILED',
    UNSUPPORTED_MEDIA_FILE = 'UNSUPPORTED_MEDIA_FILE',
    UNAVAILABLE_LINK = 'UNAVAILABLE_LINK'
}  

export class ErrorHandler {

    // #region MEMBERS
    // --------------------------------------------------

    private static instance: ErrorHandler = null;

    private logger: Logger;
    private eventBus: EventBus;

    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    static getInstance() {
        if (this.instance === null) {
            this.instance = new ErrorHandler();
        }
        return this.instance;
    }

    constructor() {
        this.logger = Logger.getInstance();
        this.eventBus = EventBus.getInstance();
    }

    /**
     * [sendWarning description]
     * @param  {[type]} code    [description]
     * @param  {[type]} message [description]
     * @param  {[type]} data    [description]
     * @return {[type]}         [description]
     */
    sendWarning (code, message, data) {
        this.eventBus.dispatchEvent({
            type: 'warning',
            data: {
                code: code,
                message: message,
                data: data
            }
        });
        this.logger.warn('[Warn] Code: ' + code + ', Message: ' + message + ', Data: ' + JSON.stringify(data, null, '\t'));
    }

    /**
     * [sendError description]
     * @param  {[type]} code    [description]
     * @param  {[type]} message [description]
     * @param  {[type]} data    [description]
     * @return {[type]}         [description]
     */
    sendError (code, message, data) {
        this.eventBus.dispatchEvent({
            type: 'error',
            data: {
                code: code,
                message: message,
                data: data
            }
        });
        this.logger.error('[Error] Code: ' + code + ', Message: ' + message + ', Data: ' + JSON.stringify(data, null, '\t'));
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------
}
