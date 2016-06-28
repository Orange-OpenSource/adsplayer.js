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

AdsPlayer.Debug = (function() {
    var instance;

    function createInstance() {

        // ORANGE: add level
        var NONE = 0,
            ERROR = 1,
            WARN = 2,
            INFO = 3,
            DEBUG = 4,
            ALL = 4,
            level = 0,
            showTimestamp = true,
            showElapsedTime = false,
            startTime = new Date(),
            // default logger set to console
            _logger = console,

            _log = function(logLevel, args) {
                if (logLevel <= getLevel()) {

                    var message = _prepareLog(logLevel, args);

                    switch (logLevel) {
                        case ERROR:
                            _logger.error(message);
                            break;
                        case WARN:
                            _logger.warn(message);
                            break;
                        case INFO:
                            _logger.info(message);
                            break;
                        case DEBUG:
                            _logger.debug(message);
                            break;
                    }

                }

            },

            _prepareLog = function(logLevel, args) {
                var message = "",
                    logTime = null;

                if (showTimestamp) {
                    logTime = new Date();
                    message += "[" + logTime.HHMMSSmmm() + "]";
                }

                if (_logger && _logger.showLevel) {
                    message += "[" + _getStringLevel(logLevel) + "]";
                }

                if (showElapsedTime) {
                    message += "[" + new Date(logTime - startTime).MMSSmmm() + "]";
                }

                message += "[AdsPlayer] ";

                Array.apply(null, args).forEach(function(item) {
                    message += item + " ";
                });

                return message;
            },

            _getStringLevel = function(level) {
                switch (level) {
                    case ERROR:
                        return "ERROR";
                    case WARN:
                        return "WARN";
                    case INFO:
                        return "INFO";
                    case DEBUG:
                        return "DEBUG";
                    default:
                        return "";
                }
            },


            getLevel = function() {
                return level;
            },

            getLogger = function() {
                return _logger;
            };

        return {

            // ORANGE: add level
            NONE: NONE,
            ERROR: ERROR,
            WARN: WARN,
            INFO: INFO,
            DEBUG: DEBUG,
            ALL: ALL,

            getLevel: getLevel,
            getLogger: getLogger,

            setLevel: function(value) {
                level = value;
            },

            setLogger: function(type) {
                switch (type) {
                    case 'log4javascript':
                        var appender = new log4javascript.PopUpAppender();
                        var layout = new log4javascript.PatternLayout("%d{HH:mm:ss.SSS} %-5p - %m%n");
                        appender.setLayout(layout);
                        _logger.addAppender(appender);
                        _logger.setLevel(log4javascript.Level.ALL);
                        _logger.initialized = true;
                        break;

                    case 'memory':
                        _logger = new MemoryLogger();
                        break;

                    case 'console':
                        _logger = console;
                        break;

                    default:
                        _logger = null;
                }
            },

            error: function() {
                _log.call(this, ERROR, arguments);
            },

            warn: function() {
                _log.call(this, WARN, arguments);
            },

            info: function() {
                _log.call(this, INFO, arguments);
            },

            // Keep this function for compatibility
            log: function() {
                _log.call(this, DEBUG, arguments);
            }
        };
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
