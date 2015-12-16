(function (window) {

    var enplug = window.enplug || (window.enplug = {}),
        targetDomain = '*',
        targetOrigin = targetDomain,
        tag = '[Enplug SDK] ',
        noop = function () {};  // Placeholder for when a callback isn't provided

    function isValidJson(json) {
        try {
            var o = window.JSON.parse(window.JSON.stringify(window.JSON.parse(json)));
            if (o && typeof o === 'object' && o !== null) {
                return true;
            }
        } catch (e) {
            return false;
        }

        return false;
    }

    function debug(message) {
        if (enplug.transport.debug) {
            arguments[0] = tag + arguments[0];
            console.log.apply(console, arguments);
        }
    }

    // Posts message to parent window
    function sendMessage(methodCall) {
        debug('Calling method:', methodCall);
        try {
            var json = JSON.stringify(methodCall);
            window.parent.postMessage(json, targetOrigin);
        } catch (e) {
            window.console.error('Enplug SDK error:', e);
        }
    }

    // Receives responses from parent window
    function receiveMessage(event) {
        if (isValidJson(event.data)) {
            var response = window.JSON.parse(event.data);
            if (typeof response.callId === 'number') {
                var methodCall = enplug.transport.pendingCalls[response.callId];
                if (methodCall) {
                    if (!methodCall.persistent) {
                        delete enplug.transport.pendingCalls[response.callId];
                    }

                    debug('Calling method ' + (response.success ? 'success' : 'error') + ' callback:', {
                        method: methodCall,
                        response: response
                    });

                    var cb = response.success ? methodCall.successCallback : methodCall.errorCallback;
                    cb(response.data);

                    return true;
                }
            } else {
                debug('Did not recognize window message response format:', event);
            }
        } else {
            debug('Did not recognize non-JSON window message:', event);
        }
    }

    enplug.transport = {

        callId: 0,
        debug: false,
        pendingCalls: {},

        /**
         * Makes an API call against the Enplug dashboard parent window.
         *
         * @param {Object} methodCall The API call config.
         * @param {string} methodCall.name
         * @param {*} methodCall.params The data to be sent as parameters to the API.
         * @param {boolean} methodCall.transient For API calls that don't expect a response.
         * @param {boolean} methodCall.persistent For API calls that expect multiple responses.
         * @param {function} methodCall.successCallback
         * @param {function} methodCall.errorCallback
         */
        callMethod: function (methodCall) {
            if (methodCall.name) {
                methodCall.callId = this.callId++;
                methodCall.transient = !!methodCall.transient;
                methodCall.persistent = !!methodCall.persistent;

                if (methodCall.successCallback && typeof methodCall.successCallback !== 'function') {
                    throw new Error('');
                } else {
                    methodCall.successCallback = methodCall.successCallback || noop;
                }

                if (methodCall.errorCallback && typeof methodCall.errorCallback !== 'function') {
                    throw new Error('');
                } else {
                    methodCall.errorCallback = methodCall.errorCallback || noop;
                }

                if (!methodCall.transient) {
                    this.pendingCalls[methodCall.callId] = methodCall;
                }

                sendMessage(methodCall);
            } else {
                throw new Error('');
            }
        }
    };

    // Receive parent window response messages
    window.addEventListener('message', receiveMessage, false);
}(window));
