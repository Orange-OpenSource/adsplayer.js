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

        for (i = 0; i < listeners.length; i += 1) {
            listeners[i].call(this, evt);
        }
        return !evt.defaultPrevented;
    }
}

export default EventBus;