/**
* Errors and warning notifications handler.
*/

import Debug from './Debug';
import EventBus from './EventBus';

let _instance = null;


class ErrorHandler {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    static getInstance() {
        if (_instance === null) {
            _instance = new ErrorHandler();
        }

        return _instance;
    }

    constructor() {

        if (_instance !== null) {
            return _instance;
        }

        this._eventBus = EventBus.getInstance();
        this._debug = Debug.getInstance();

        _instance = this;
        return _instance;
    }

    /**
     * [sendWarning description]
     * @param  {[type]} code    [description]
     * @param  {[type]} message [description]
     * @param  {[type]} data    [description]
     * @return {[type]}         [description]
     */
    sendWarning (code, message, data) {
        this._eventBus.dispatchEvent({
            type: 'warning',
            data: {
                code: code,
                message: message,
                data: data
            }
        });
        this._debug.warn("[Warn] Code: " + code + ", Message: " + message + ", Data: " + JSON.stringify(data, null, '\t'));
    }

    /**
     * [sendError description]
     * @param  {[type]} code    [description]
     * @param  {[type]} message [description]
     * @param  {[type]} data    [description]
     * @return {[type]}         [description]
     */
    sendError (code, message, data) {
        this._eventBus.dispatchEvent({
            type: 'error',
            data: {
                code: code,
                message: message,
                data: data
            }
        });
        this._debug.error("[Error] Code: " + code + ", Message: " + message + ", Data: " + JSON.stringify(data, null, '\t'));
    }
}

// File Loader errors
ErrorHandler.DOWNLOAD_ERR_FILES = "DOWNLOAD_ERR_FILES";
ErrorHandler.DOWNLOAD_ERR_NOT_XML = "DOWNLOAD_ERR_NOT_XML";

ErrorHandler.LOAD_VAST_FAILED = "LOAD_VAST_FAILED";

// Media Player errors
ErrorHandler.NO_VALID_MEDIA_FOUND = "NO_VALID_MEDIA_FOUND";
ErrorHandler.LOAD_MEDIA_FAILED = "LOAD_MEDIA_FAILED";
ErrorHandler.UNSUPPORTED_MEDIA_FILE = "UNSUPPORTED_MEDIA_FILE";
ErrorHandler.UNAVAILABLE_LINK = "UNAVAILABLE_LINK";

export default ErrorHandler;
