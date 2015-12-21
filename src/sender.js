(function (window, enplug) {
    'use strict';

    /**
     * Base class for sending messages using a transport to the parent window (dashboard).
     *
     * @param {string} prefix - The namespace for the sender's transport.
     * @class
     */
    function Sender(prefix) {
        if (!prefix) {

            // Transports can't work without a prefix/namespace
            throw new Error(enplug.classes.Transport.prototype.TAG + 'Senders must specify a method prefix.');
        }

        /**
         * Transport namespace.
         * @type {string}
         */
        this.prefix = prefix;

        /**
         * Disables validation of method params. Used for testing.
         * @type {boolean}
         */
        this.novalidate = false;

        /**
         * Sends and receives messages to/from the parent window.
         * @type {Transport}
         */
        this.transport = new enplug.classes.Transport(window, prefix);
    }

    Sender.prototype = {

        /**
         * Validates data types before being sent to dashboard. Disabled with this.novalidate=true (for tests).
         *
         * @param {*} data - The value to be validated.
         * @param {string} expectedType - Valid output from typeof, or 'array'.
         * @param {string} errorMessage
         */
        validate: function (data, expectedType, errorMessage) {
            if (!this.novalidate) {
                if (data === null || typeof data !== expectedType || (expectedType === 'array' && !Array.isArray(data))) {
                    throw new Error(this.transport.TAG + errorMessage);
                }
            }
        },

        /**
         * Factory for all SDK method calls.
         *
         * @param {MethodCall} options
         * @returns {number} callId
         */
        method: function (options) {

            if (typeof options === 'object') {

                // Add implementation-specific method prefix (dashboard or app)
                options.name = this.prefix + '.' + options.name;
                return this.transport.send(options);
            }  else {
                throw new Error('Transport options must be an object.');
            }
        },

        /**
         * Removes this sender's transport event listeners to prevent memory leaks.
         */
        cleanup: function () {
            this.transport.cleanup();
        }
    };

    // Export
    enplug.classes.Sender = Sender;
}(window, window.enplug));
