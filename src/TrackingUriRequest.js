        function TrackingUriRequest(debug) {
            this.debug = debug;
        }

        TrackingUriRequest.prototype.http = function(type, uri, data, callback) {

            var http = new XMLHttpRequest();

            if (uri === "") {
                return;
            }
            this.debug.log('post to ' + uri);

            http.open(type, uri, true);
            http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            http.timeout = 2000;

            http.onloadend = http.onerror = function() {
                if (callback) {
                    callback(http.status, http.response);
                }
            };

            if (type === 'GET') {
                http.send();
            } else {
                this.debug.log('[TrackingUriRequest][' + uri + '] - Send message: ' + data);
                http.send(data);
            }

        };