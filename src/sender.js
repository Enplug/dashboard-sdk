(function (window, enplug) {
    'use strict';

    /**
     * @param prefix
     * @class
     */
    function Sender(prefix) {
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
                if (!data || typeof data !== expectedType || (expectedType === 'array' && !Array.isArray(data))) {
                    throw new Error(errorMessage);
                }
            }
        },

        method: function (options) {

            if (typeof options === 'object') {

                // Add implementation-specific method prefix (dashboard or app)
                options.name = this.prefix + '.' + options.name;
                return this.transport.send(options);
            }  else {
                throw new Error('');
            }
        }
    };

    enplug.classes.Sender = Sender;
}(window, window.enplug));
