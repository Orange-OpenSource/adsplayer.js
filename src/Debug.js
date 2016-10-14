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

        if (this.showTimestamp) {
            logTime = new Date();
            message += "[" + logTime.HHMMSSmmm() + "]";
        }

        if (this._logger && this._logger.showLevel) {
            message += "[" + this._getStringLevel(logLevel) + "]";
        }

        if (this.showElapsedTime) {
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

    // Keep this function for compatibility
    log () {
        this._log(DEBUG, arguments);
    }
}

export default Debug;