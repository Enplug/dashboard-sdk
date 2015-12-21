(function (window) {
    'use strict';

    var enplug = window.enplug || (window.enplug = { debug: false, classes: {}, noop: function () {} }),
        targetOrigin = '*', // this is set to * to support various developer localhosts
        TAG = '[Enplug SDK] ';

    /**
     * Transports are used to communicate with the dashboard parent window.
     *
     * @param window
     * @param {string} namespace - Determines which events a transport responds to.
     * @constructor
     * @implements EventListener
     */
    function Transport(window, namespace) {

        /**
         * A single call sent by a {@link Sender} through a transport to the parent dashboard.
         * @typedef {Object} MethodCall
         * @property {string} name
         * @property {number} callId - An identifier assigned by transport.send(). Can be used to lookup in pending calls.
         * @property {*} params - The data to be sent as parameters to the API.
         * @property {boolean} transient - For API calls that don't expect a response.
         * @property {boolean} persistent - For API calls that expect multiple responses.
         * @property {function} successCallback
         * @property {function} errorCallback
         */

        /**
         * Incremented before being assigned, so call IDs start with 1
         * @type {number}
         */
        this.callId = 0;

        /**
         * Stores the method call.
         * @type {Object.<number, MethodCall>}
         */
        this.pendingCalls = {};

        /**
         * The namespace for events this transport will respond to.
         * @type {string}
         */
        this.namespace = namespace;

        /**
         * Logs messages to console when enplug.debug is enabled. Adds tag to messages.
         * @param message
         */
        function debug(message) {
            if (enplug.debug) {
                arguments[0] = TAG + arguments[0];
                console.log.apply(console, arguments);
            }
        }

        /**
         * Validate and assign defaults for callback methods.
         * @param {MethodCall} options
         */
        function validateCallbacks(options) {
            if (options.successCallback && typeof options.successCallback !== 'function') {
                throw new Error(TAG + 'Success callback must be a function.');
            } else {
                options.successCallback = options.successCallback || enplug.noop;
            }

            if (options.errorCallback && typeof options.errorCallback !== 'function') {
                throw new Error(TAG + 'Error callback must be a function.');
            } else {
                options.errorCallback = options.errorCallback || enplug.noop;
            }
        }

        /**
         * Verifies that a message is intended for the transport.
         * @param {MessageEvent} event
         * @returns {boolean} - Whether the message was successfully parsed.
         */
        function parseResponse(event) {
            try {
                var response = JSON.parse(event.data);

                // Check for success key to ignore messages being sent
                if (response.namespace === namespace && typeof response.success === 'boolean') {
                    return response;
                }

                return false;
            } catch (e) {}

            return false;
        }

        /**
         * Makes an API call against the Enplug dashboard parent window.
         *
         * @param {MethodCall} options - The API call config.
         * @returns {number} callId
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
                    console.error(TAG + 'Error:', e);
                }

                return options.callId;
            } else {
                throw new Error(TAG + 'All transport method calls must have a name.');
            }
        };

        /**
         * Receives response messages from parent window/dashboard.
         *
         * @param {MessageEvent} event
         * @returns {boolean} - true if successfully processed, otherwise false.
         */
        this.handleEvent = function (event) {
            if (event.type === 'message') {
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
            }
        };

        /**
         * Removes event listeners to prevent memory leaks.
         */
        this.cleanup = function () {
            window.removeEventListener('message', this, false);
        };

        // Receive parent window response messages
        window.addEventListener('message', this, false);
    }

    /**
     * The tag is used in debug log statements.
     * @type {string}
     */
    Transport.prototype.TAG = TAG;

    // Export
    enplug.classes.Transport = Transport;
}(window));
