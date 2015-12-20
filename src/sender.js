(function (window, enplug) {
    'use strict';

    /**
     * @param prefix
     * @class
     */
    function Sender(prefix) {
        if (!prefix) {
            throw new Error(''); // Transports can't work without a prefix
        }

        this.prefix = prefix;
        this.novalidate = false;
        this.transport = new enplug.classes.Transport(window, prefix);
    }

    Sender.prototype = {

        /**
         * Validates data before being sent to dashboard. Supports this.novalidate for tests.
         * @param data
         * @param expectedType
         * @param errorMessage
         */
        validate: function (data, expectedType, errorMessage) {
            if (!this.novalidate) {
                if (data === null || typeof data !== expectedType || (expectedType === 'array' && !Array.isArray(data))) {
                    throw new Error(this.transport.tag + errorMessage);
                }
            }
        },

        /**
         *
         * @param options
         * @returns {*}
         */
        method: function (options) {

            if (typeof options === 'object') {

                // Add implementation-specific method prefix (dashboard or app)
                options.name = this.prefix + '.' + options.name;
                return this.transport.send(options);
            }  else {
                throw new Error('');
            }
        },

        /**
         *
         */
        cleanup: function () {
            this.transport.cleanup();
        }
    };

    enplug.classes.Sender = Sender;
}(window, window.enplug));
