(function (window) {
    'use strict';

    // Todo domains

    var enplug = window.enplug || (window.enplug = { debug: false }),
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
        if (enplug.debug) {
            arguments[0] = tag + arguments[0];
            console.log.apply(console, arguments);
        }
    }

    // Posts message to parent window
    function sendToParent(methodCall) {
        debug('Calling method:', methodCall);
        try {
            var json = JSON.stringify(methodCall);
            window.parent.postMessage(json, targetOrigin);
        } catch (e) {
            window.console.error('Enplug SDK error:', e);
        }
    }

    // Receives responses from parent window
    function receiveFromParent(event) {
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

    /**
     * enplug.transport is used to communicate with the dashboard parent window
     *
     * @typedef {Object} enplug.transport
     * @property {number} callId
     * @property {boolean} debug
     * @property {Object} pendingCalls
     * @property {function} callMethod
     */
    enplug.transport = {

        callId: 0,
        debug: false,
        pendingCalls: {},

        /**
         * Makes an API call against the Enplug dashboard parent window.
         *
         * @param {Object} options - The API call config.
         * @param {string} options.name
         * @param {*} options.params - The data to be sent as parameters to the API.
         * @param {boolean} options.transient - For API calls that don't expect a response.
         * @param {boolean} options.persistent - For API calls that expect multiple responses.
         * @param {function} options.successCallback
         * @param {function} options.errorCallback
         */
        send: function (options) {
            if (options.name) {
                options.callId = this.callId++;
                options.transient = !!options.transient;
                options.persistent = !!options.persistent;

                if (options.transient) {

                    // Transient method calls won't receive callbacks, so notify
                    // developer if they provided one
                    if (typeof options.errorCallback === 'function') {
                        throw new Error('');
                    }

                    if (typeof options.successCallback === 'function') {
                        throw new Error('');
                    }
                } else {

                    // Validate and assign defaults for callback methods
                    if (options.successCallback && typeof options.successCallback !== 'function') {
                        throw new Error('');
                    } else {
                        options.successCallback = options.successCallback || noop;
                    }

                    if (options.errorCallback && typeof options.errorCallback !== 'function') {
                        throw new Error('');
                    } else {
                        options.errorCallback = options.errorCallback || noop;
                    }

                    // Push this non-transient method call into the pending stack, so that
                    // we can get it when a response is received
                    this.pendingCalls[options.callId] = options;
                }

                sendToParent(options);
            } else {
                throw new Error('');
            }
        },

        /**
         *
         * @param context
         * @param prefix
         * @returns {Object}
         */
        factory: function (context, prefix) {
            context.method = function (options) {
                options.name = prefix + '.' + options.name;
                enplug.transport.send(options);
                return options.callId;
            };

            return context;
        }
    };

    // Receive parent window response messages
    window.addEventListener('message', receiveFromParent, false);
}(window));
