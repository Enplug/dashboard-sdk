(function (window) {
    'use strict';

    var enplug = window.enplug || (window.enplug = { debug: false, classes: {}, noop: function () {} }),
        targetOrigin = '*', // this is set to * to support various developer localhosts
        tag = '[Enplug SDK] ';

    function isValidJson(json) {
        try {
            var o = JSON.parse(JSON.stringify(JSON.parse(json)));
            if (o && typeof o === 'object' && o !== null) {
                return true;
            }
        } catch (e) {}

        return false;
    }

    function debug(message) {
        if (enplug.debug) {
            arguments[0] = tag + arguments[0];
            console.log.apply(console, arguments);
        }
    }

    /**
     * Validate and assign defaults for callback methods.
     * @param options
     */
    function validateCallbacks(options) {
        if (options.successCallback && typeof options.successCallback !== 'function') {
            throw new Error(tag + 'Success callback must be a function.');
        } else {
            options.successCallback = options.successCallback || enplug.noop;
        }

        if (options.errorCallback && typeof options.errorCallback !== 'function') {
            throw new Error(tag + 'Error callback must be a function.');
        } else {
            options.errorCallback = options.errorCallback || enplug.noop;
        }
    }

    /**
     * Transports are used to communicate with the dashboard parent window.
     * @param window
     * @param namespace
     * @constructor
     */
    enplug.classes.Transport = function (window, namespace) {

        /**
         * Incremented before being assigned, so call IDs start with 1
         * @type {number}
         */
        this.callId = 0;

        /**
         *
         * @type {{}}
         */
        this.pendingCalls = {};

        /**
         *
         * @type {string}
         */
        this.tag = tag;

        /**
         * Verifies that a message is intended for the transport.
         * @param event
         * @returns {boolean}
         */
        function parseResponse(event) {
            if (isValidJson(event.data)) {
                var response = JSON.parse(event.data);

                // Check for success key to ignore messages being sent
                if (response.namespace === namespace && typeof response.success === 'boolean') {
                    return response;
                }

                // Don't log for message posted by this same window
                if (!response.namespace) {
                    debug('Did not recognize window message response format:', event);
                }

                return false;
            }

            debug('Did not recognize non-JSON window message:', event);
            return false;
        }

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
        this.send = function (options) {
            if (options.name) {
                options.callId = ++this.callId;
                options.namespace = namespace;
                options.transient = !!options.transient;
                options.persistent = !!options.persistent;

                validateCallbacks(options);
                debug('Calling method:', options);

                if (!options.transient) {

                    // Push this non-transient method call into the pending stack, so that
                    // we can get it when a response is received
                    this.pendingCalls[options.callId] = options;
                }

                try {
                    var json = JSON.stringify(options);
                    window.parent.postMessage(json, targetOrigin);
                } catch (e) {
                    console.error(tag + 'Error:', e);
                }

                return options.callId;
            } else {
                throw new Error(tag + 'All transport method calls must have a name.');
            }
        };

        /**
         * Receives response messages from parent window/dashboard.
         * @param event
         * @returns {boolean} - true if successfully processed, otherwise false.
         */
        this.receive = function (event) {
            var response = parseResponse(event);
            if (response) {
                var methodCall = this.pendingCalls[response.callId];
                if (methodCall) {
                    if (!methodCall.persistent) {
                        delete this.pendingCalls[response.callId];
                    }

                    debug('Calling method ' + (response.success ? 'success' : 'error') + ' callback:', {
                        call: methodCall,
                        response: response
                    });

                    var cb = response.success ? methodCall.successCallback : methodCall.errorCallback;
                    cb(response.data);

                    return true;
                }
            }

            return false;
        };

        // Receive parent window response messages
        window.addEventListener('message', this.receive, false);
    };
}(window));
