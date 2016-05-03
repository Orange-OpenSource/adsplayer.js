
AdsPlayer.EventBus = (function() {
    "use strict"; // TBC
    var instance;

    function createInstance() {
        var registrations = {},

            _getListeners = function(type, useCapture) {
                if (useCapture === undefined) { // to provide a default parameter that works !! 
                    useCapture = false;
                }
                var captype = (useCapture ? '1' : '0') + type;

                if (!(captype in registrations)) {
                    registrations[captype] = [];
                }

                return registrations[captype];
            };

        return {
            /**
             * [addEventListener description]
             * @param {[type]} type       [description]
             * @param {[type]} listener   [description]
             * @param {[type]} useCapture [description]
             */
            addEventListener: function(type, listener, useCapture) {
                var listeners = _getListeners(type, useCapture),
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
                var listeners = _getListeners(type, useCapture),
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
                var listeners = _getListeners(evt.type, false).slice(),
                    i = 0;

                for (i = 0; i < listeners.length; i += 1) {
                    listeners[i].call(this, evt);
                }
                return !evt.defaultPrevented;
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