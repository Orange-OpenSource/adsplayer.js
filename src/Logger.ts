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
* Date prorotype extension
*/
declare global {
    interface Date {
        HHMMSSmmm(): string;
        MMSSmmm(): string;
    }
  }
  
Date.prototype.HHMMSSmmm = function() {
    let h = this.getHours().toString(),
        m = this.getMinutes().toString(),
        s = this.getSeconds().toString(),
        ms = this.getMilliseconds().toString(),
        HH = h[1] ? h : '0' + h[0],
        MM = m[1] ? m : '0' + m[0],
        SS = s[1] ? s : '0' + s[0],
        mmm = ms[2] ? ms : '0' + (ms[1] ? ms : '0' + ms[0]);

    return HH + ':' + MM + ':' + SS + '.' + mmm;
};

Date.prototype.MMSSmmm = function() {
    let m = this.getMinutes().toString(),
        s = this.getSeconds().toString(),
        ms = this.getMilliseconds().toString(),
        MM = m[1] ? m : '0' + m[0],
        SS = s[1] ? s : '0' + s[0],
        mmm = ms[2] ? ms : '0' + (ms[1] ? ms : '0' + ms[0]);

    return MM + ':' + SS + '.' + mmm;
};


export enum LOG_LEVEL {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    ALL = 4,
}  

export class Logger {

    // #region MEMBERS
    // --------------------------------------------------

    private static instance: Logger = null;

    level: LOG_LEVEL;
    showTimestamp: boolean;
    showElapsedTime: boolean;
    startTime: Date;
    logger: any;

    // #endregion MEMBERS
    // --------------------------------------------------

    // #region PUBLIC FUNCTIONS
    // --------------------------------------------------

    static getInstance() {
        if (this.instance === null) {
            this.instance = new Logger();
        }
        return this.instance;
    }

    constructor() {
        this.level = LOG_LEVEL.ALL;
        this.showTimestamp = true;
        this.showElapsedTime = false;
        this.startTime = new Date();
        this.logger = console;
    }

    getLevel (): LOG_LEVEL {
        return this.level;
    }

    setLevel (value: LOG_LEVEL) {
        this.level = value;
    }

    error(...args: any[]) {
        this.log(LOG_LEVEL.ERROR, args);
    }

    warn (...args: any[]) {
        this.log(LOG_LEVEL.WARN, args);
    }

    info (...args: any[]) {
        this.log(LOG_LEVEL.INFO, args);
    }

    debug (...args: any[]) {
        this.log(LOG_LEVEL.DEBUG, args);
    }

    // #endregion PUBLIC FUNCTIONS
    // --------------------------------------------------


    // #region PRIVATE FUNCTIONS
    // --------------------------------------------------

    getStringLevel(level) {
        switch (level) {
            case LOG_LEVEL.NONE:
                return '';
            case LOG_LEVEL.ERROR:
                return 'ERROR';
            case LOG_LEVEL.WARN:
                return 'WARN';
            case LOG_LEVEL.INFO:
                return 'INFO';
            case LOG_LEVEL.DEBUG:
            case LOG_LEVEL.ALL:
                return 'DEBUG';
            default:
                return '';
        }
    }

    prepareLog(logLevel, ...args: any[]) {
        let message = '',
            logTime = new Date();

        if (this.showTimestamp) {
            message += '[' + logTime.HHMMSSmmm() + ']';
        }

        if (this.logger && this.logger.showLevel) {
            message += '[' + this.getStringLevel(logLevel) + ']';
        }

        if (this.showElapsedTime) {
            message += '[' + new Date(logTime.getTime() - this.startTime.getTime()).MMSSmmm() + ']';
        }

        message += '[AdsPlayer] ';

        Array.apply(null, args).forEach(function(item) {
            message += item + ' ';
        });

        return message;
    }

    log (logLevel: LOG_LEVEL, ...args: any[]) {
        if (logLevel > this.getLevel()) {
            return;
        }
        let message = this.prepareLog(logLevel, args);
        switch (logLevel) {
            case LOG_LEVEL.ERROR:
                this.logger.error(message);
                break;
            case LOG_LEVEL.WARN:
                this.logger.warn(message);
                break;
            case LOG_LEVEL.INFO:
                this.logger.info(message);
                break;
            case LOG_LEVEL.DEBUG:
                this.logger.debug(message);
                break;
        }
    }

    // #endregion PRIVATE FUNCTIONS
    // --------------------------------------------------
}
