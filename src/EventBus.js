
_EventBus = (function() {
    var instance;

    function createInstance() {
        var object = new AdsPlayer.EventBus();
        return object;
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


AdsPlayer.EventBus = function() {
    "use strict";

    var registrations,

        getListeners = function(type, useCapture) {
            if (useCapture === undefined) { // to provide a default parameter that works !! 
                useCapture = false;
            }
            var captype = (useCapture ? '1' : '0') + type;

            if (!(captype in registrations)) {
                registrations[captype] = [];
            }

            return registrations[captype];
        },

        init = function() {
            registrations = {};
        };

    init();

    return {
        /**
         * [addEventListener description]
         * @param {[type]} type       [description]
         * @param {[type]} listener   [description]
         * @param {[type]} useCapture [description]
         */
        addEventListener: function(type, listener, useCapture) {
            var listeners = getListeners(type, useCapture),
                idx = listeners.indexOf(listener);

            if (idx === -1) {
                listeners.push(listener);
            }
        },

        /**
         * [removeEventListener description]
         * @param  {[type]} type       [description]
         * @param  {[type]} listener   [description]
         * @param  {[type]} useCapture [description]
         * @return {[type]}            [description]
         */
        removeEventListener: function(type, listener, useCapture) {
            var listeners = getListeners(type, useCapture),
                idx = listeners.indexOf(listener);

            if (idx !== -1) {
                listeners.splice(idx, 1);
            }
        },

        /**
         * [dispatchEvent description]
         * @param  {[type]} evt [description]
         * @return {[type]}     [description]
         */
        dispatchEvent: function(evt) {
            var listeners = getListeners(evt.type, false).slice(),
                i = 0;

            for (i = 0; i < listeners.length; i += 1) {
                listeners[i].call(this, evt);
            }
            return !evt.defaultPrevented;
        }
    };
};