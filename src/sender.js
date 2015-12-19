(function (enplug) {
    'use strict';

    /**
     * @param prefix
     * @class
     */
    function Sender(prefix) {
        this.prefix = prefix;
    }

    Sender.prototype = {

        validate: function (data, expectedType, errorMessage) {
            if (this.shouldValidate) {
                if (!data || typeof data !== expectedType || (expectedType === 'array' && !Array.isArray(data))) {
                    throw new Error(errorMessage);
                }
            }
        },

        method: function (options) {

            if (typeof options === 'object') {

                // Add implementation-specific method prefix (dashboard or app)
                options.name = this.prefix + '.' + options.name;
                options.namespace = enplug.transport.namespace;

                return enplug.transport.send(options);
            }  else {
                throw new Error('');
            }
        }
    };

    enplug.classes.Sender = Sender;
}(window.enplug));
