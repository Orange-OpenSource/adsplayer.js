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
* Debug utility class.
*/
Date.prototype.HHMMSSmmm = function() {

    var h = this.getHours().toString(),
        m = this.getMinutes().toString(),
        s = this.getSeconds().toString(),
        ms = this.getMilliseconds().toString(),
        HH = h[1] ? h : "0" + h[0],
        MM = m[1] ? m : "0" + m[0],
        SS = s[1] ? s : "0" + s[0],
        mmm = ms[2] ? ms : "0" + (ms[1] ? ms : "0" + ms[0]);

    return HH + ":" + MM + ":" + SS + "." + mmm;
};

Date.prototype.MMSSmmm = function() {

    var m = this.getMinutes().toString(),
        s = this.getSeconds().toString(),
        ms = this.getMilliseconds().toString(),
        MM = m[1] ? m : "0" + m[0],
        SS = s[1] ? s : "0" + s[0],
        mmm = ms[2] ? ms : "0" + (ms[1] ? ms : "0" + ms[0]);

    return MM + ":" + SS + "." + mmm;
};

// MemoryLogger definition

var MemoryLogger = function() {
    // array to store logs
    this.logArray = [];
    // boolean to set leve in message
    this.showLevel = true;
};

MemoryLogger.prototype.error =
    MemoryLogger.prototype.warn =
    MemoryLogger.prototype.info =
    MemoryLogger.prototype.debug = function(message) {
        this.logArray.push(message);
};

MemoryLogger.prototype.getLogs = function() {
    return this.logArray;
};


const NONE = 0;
const ERROR = 1;
const WARN = 2;
const INFO = 3;
const DEBUG = 4;
const ALL = 4;


let _instance = null;

class Debug {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _getStringLevel(level) {
        switch (level) {
            case NONE:
                return "";
            case ERROR:
                return "ERROR";
            case WARN:
                return "WARN";
            case INFO:
                return "INFO";
            case DEBUG:
            case ALL:
                return "DEBUG";
            default:
                return "";
        }
    }

    _prepareLog(logLevel, args) {
        let message = "",
            logTime = null;

        if (this._showTimestamp) {
            logTime = new Date();
            message += "[" + logTime.HHMMSSmmm() + "]";
        }

        if (this._logger && this._logger.showLevel) {
            message += "[" + this._getStringLevel(logLevel) + "]";
        }

        if (this._showElapsedTime) {
            message += "[" + new Date(logTime - this._startTime).MMSSmmm() + "]";
        }

        message += "[AdsPlayer] ";

        Array.apply(null, args).forEach(function(item) {
            message += item + " ";
        });

        return message;
    }

    _log (logLevel, args) {
        if (logLevel <= this.getLevel()) {

            let message = this._prepareLog(logLevel, args);

            switch (logLevel) {
                case ERROR:
                    this._logger.error(message);
                    break;
                case WARN:
                    this._logger.warn(message);
                    break;
                case INFO:
                    this._logger.info(message);
                    break;
                case DEBUG:
                    this._logger.debug(message);
                    break;
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    static getInstance() {
        if (_instance === null) {
            _instance = new Debug();
        }

        return _instance;
    }

    constructor() {

        if (_instance !== null) {
            return _instance;
        }

        this._level = 4;
        this._showTimestamp = true;
        this._showElapsedTime = false;
        this._startTime = new Date();
        this._logger = console;

        _instance = this;
        return _instance;
    }

    getLevel () {
        return this._level;
    }

    setLevel (value) {
        this._level = value;
    }

    getLogger () {
        return this._logger;
    }

    setLogger (type) {
        switch (type) {
            case 'memory':
                this._logger = new MemoryLogger();
                break;

            case 'console':
                this._logger = console;
                break;

            default:
                this._logger = null;
        }
    }

    error() {
        this._log(ERROR, arguments);
    }

    warn () {
        this._log(WARN, arguments);
    }

    info () {
        this._log(INFO, arguments);
    }

    log () {
        this._log(DEBUG, arguments);
    }
}

export default Debug;