/**
 * Errors and warning notifications handler.
 */
AdsPlayer.ErrorHandler = (function() {
    "use strict";
    var instance;

    function createInstance() {

        var _eventBus = AdsPlayer.EventBus.getInstance(),
            _debug = AdsPlayer.Debug.getInstance();

        return {

            /**
             * [sendWarning description]
             * @param  {[type]} code    [description]
             * @param  {[type]} message [description]
             * @param  {[type]} data    [description]
             * @return {[type]}         [description]
             */
            sendWarning: function(code, message, data) {
                _eventBus.dispatchEvent({
                    type: 'warning',
                    data: {
                        code: code,
                        message: message,
                        data: data
                    }
                });
                _debug.warn("[Warn] Code: " + code + ", Message: " + message + ", Data: " + JSON.stringify(data, null, '\t'));
            },

            /**
             * [sendError description]
             * @param  {[type]} code    [description]
             * @param  {[type]} message [description]
             * @param  {[type]} data    [description]
             * @return {[type]}         [description]
             */
            sendError: function(code, message, data) {
                _eventBus.dispatchEvent({
                    type: 'error',
                    data: {
                        code: code,
                        message: message,
                        data: data
                    }
                });
                _debug.error("[Error] Code: " + code + ", Message: " + message + ", Data: " + JSON.stringify(data, null, '\t'));
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

/*
AdsPlayer.ErrorHandler.prototype = {
    constructor: AdsPlayer.ErrorHandler
};*/

// File Loader errors
AdsPlayer.ErrorHandler.DOWNLOAD_ERR_FILES = "DOWNLOAD_ERR_FILES";
AdsPlayer.ErrorHandler.DOWNLOAD_ERR_NOT_XML = "DOWNLOAD_ERR_NOT_XML";

AdsPlayer.ErrorHandler.LOAD_VAST_FAILED = "LOAD_VAST_FAILED";

// Media Player errors
AdsPlayer.ErrorHandler.NO_VALID_MEDIA_FOUND = "NO_VALID_MEDIA_FOUND";
AdsPlayer.ErrorHandler.LOAD_MEDIA_FAILED = "LOAD_MEDIA_FAILED";
AdsPlayer.ErrorHandler.UNSUPPORTED_MEDIA_FILE = "UNSUPPORTED_MEDIA_FILE";
AdsPlayer.ErrorHandler.UNAVAILABLE_LINK = "UNAVAILABLE_LINK";
