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
                    throw new Error(this.transport.tag + errorMessage);
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

(function (enplug) {
    'use strict';

    var methodPrefix = 'app';

    /**
     * @class
     * @extends Sender
     */
    function AccountSender() {

        // Call parent constructor
        enplug.classes.Sender.call(this, methodPrefix);

        this.getAccount = function (onSuccess, onError) {
            return this.method({
                name: 'getAccount',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getDisplayGroup = function (onSuccess, onError) {
            return this.method({
                name: 'getDisplay',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getInstances = function (accountId, onSuccess, onError) {
            this.validate(accountId, 'string', 'Missing account ID (string).');
            return this.method({
                name: 'getInstances',
                params: accountId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getAssets',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getDefaultAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getDefaultAssets',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.createAsset = function (name, value, onSuccess, onError) {
            this.validate(name, 'string', 'You must provide a name (string) when creating an asset.');
            this.validate(value, 'object', 'You must provide a value (object) when creating an asset.');
            return this.method({
                name: 'createAsset',
                params: [name, value],
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.createAssetFromDefault = function (defaultAssetId, onSuccess, onError) {
            this.validate(defaultAssetId, 'string', 'Missing default asset ID (string).');
            return this.method({
                name: 'createAssetFromDefault',
                params: defaultAssetId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.updateAsset = function (id, value, onSuccess, onError) {
            this.validate(id, 'string', 'You must provide the ID (string) of an asset to update.');
            this.validate(value, 'object', 'You must provide the new value (object) of an asset to update.');
            return this.method({
                name: 'updateAsset',
                params: [id, value],
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.bulkCreateAssets = function (assets, onSuccess, onError) {
            this.validate(assets, 'array', 'You must provide an array of assets to bulk create.');
            return this.method({
                name: 'bulkCreateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.bulkUpdateAssets = function (assets, onSuccess, onError) {
            this.validate(assets, 'array', 'You must provide an array of assets to bulk update.');
            return this.method({
                name: 'bulkUpdateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.bulkRemoveAssets = function (assetIds, onSuccess, onError) {
            this.validate(assetIds, 'array', 'You must provide an array of asset IDs to bulk remove.');
            return this.method({
                name: 'bulkRemoveAssets',
                params: assetIds,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.removeAsset = function (id, onSuccess, onError) {
            this.validate(id, 'string', 'You must provide the ID (string) of the asset to remove.');
            return this.method({
                name: 'removeAsset',
                params: [id],
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getThemes = function (onSuccess, onError) {
            return this.method({
                name: 'getThemes',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.createTheme = function (newTheme, onSuccess, onError) {
            this.validate(newTheme, 'object', 'You must provide the new theme (object) to create.');
            return this.method({
                name: 'createTheme',
                params: newTheme,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.removeTheme = function (themeId, onSuccess, onError) {
            this.validate(themeId, 'string', 'You must provide the ID (string) of the theme to remove.');
            return this.method({
                name: 'removeTheme',
                params: themeId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.activateTheme = function (themeId, onSuccess, onError) {
            this.validate(themeId, 'string', 'You must provide the ID (string) of the theme to activate.');
            return this.method({
                name: 'activateTheme',
                params: themeId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * @deprecated
         */
        this.getDisplay = this.getDisplayGroup;
    }

    AccountSender.prototype = Object.create(enplug.classes.Sender.prototype);

    enplug.classes.AccountSender = AccountSender;
    enplug.account = new AccountSender();
}(window.enplug));

(function (angular, enplug) {
    'use strict';

    /**
     * Modifies transport.send to return promises.
     * @param q
     * @param original
     * @returns {Function}
     */
    function decorateSend(q, original) {
        return function (options) {

            // Store originals
            var defer = q.defer(),
                onSuccess = options.successCallback,
                onError = options.errorCallback;

            options.successCallback = function (result) {
                defer.resolve(result);
                onSuccess(result);
            };

            options.errorCallback = function (result) {
                defer.reject(result);
                onError(result);
            };

            // Call the original transport method
            // but use our promise as the return value
            original.call(enplug.transport, options);
            return defer.promise;
        }
    }

    /**
     * Sets up enplug.sdk module and associated services
     * if angular is loaded on the page.
     */
    if (angular) {

        var module = angular.module('enplug.sdk', []);

        module.factory('$enplugDashboard', function ($q) {
            var sender = new enplug.classes.DashboardSender();
            sender.transport.send = decorateSend($q, sender.transport.send);
            return sender;
        });

        module.factory('$enplugAccount', function ($q) {
            var sender = new enplug.classes.AccountSender();
            sender.transport.send = decorateSend($q, sender.transport.send);
            return sender;
        });
    }
}(window.angular, window.enplug));

(function (enplug, document) {
    'use strict';

    var methodPrefix = 'dashboard'; // namespace for SDK calls

    /**
     * @class
     * @extends Sender
     */
    function DashboardSender() {

        // The buttons most recently registered with the dashboard header.
        // remembered locally so that we can respond to click events
        var currentButtons = [],

            // Keeps track of whether the dashboard is loading mode so clients can check.
            isLoading = true;

        // Call parent constructor
        enplug.classes.Sender.call(this, methodPrefix);

        this.click = function () {
            return this.method({
                name: 'click',
                transient: true // don't wait for a response
            })
        };

        this.setHeaderTitle = function (title, onSuccess, onError) {
            this.validate(title, 'string', '');
            return this.method({
                name: 'set.title',
                params: title,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.setHeaderButtons = function (buttons, onSuccess, onError) {
            this.validate(buttons, 'object', '');

            // Reset any buttons we may have stored
            currentButtons = [];

            // Allow single button or multiple
            buttons = Array.isArray(buttons) ? buttons : [buttons];
            buttons.forEach(function (button) {

                // The button ID is used to identify which button was clicked in this service
                button.id = 'button-' + (Math.round(Math.random() * (10000 - 1) + 1));
                currentButtons[button.id] = button;
            });

            return this.method({
                name: 'set.buttons',
                params: buttons,
                persistent: true,
                successCallback: function (clicked) {
                    if (clicked) {
                        var button = currentButtons[clicked.id];
                        button.action();
                    }

                    if (typeof onSuccess === 'function') {
                        onSuccess(clicked);
                    }
                },
                errorCallback: onError
            });
        };

        this.pageLoading = function (bool, onSuccess, onError) {
            this.validate(bool, 'boolean', '');
            return this.method({
                name: 'page.loading',
                params: bool,
                successCallback: function (data) {
                    isLoading = bool;
                    if (typeof onSuccess === 'function') {
                        onSuccess(data);
                    }
                },
                errorCallback: onError
            });
        };

        this.isLoading = function () {
            return isLoading;
        };

        this.pageError = function (onSuccess, onError) {
            return this.method({
                name: 'page.error',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.pageNotFound = function (onSuccess, onError) {
            return this.method({
                name: 'page.notFound',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.loadingIndicator = function (message, onSuccess, onError) {
            this.validate(message, 'object', '');
            return this.method({
                name: 'indicator.loading',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.successIndicator = function (message, onSuccess, onError) {
            this.validate(message, 'string', '');
            return this.method({
                name: 'indicator.success',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.errorIndicator = function (message, onSuccess, onError) {
            this.validate(message, 'string', '');
            return this.method({
                name: 'indicator.error',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Opens a confirm window with Yes/No buttons and configurable messages.
         *
         * @param {Object} options
         * @param {string} options.title
         * @param {string} options.text
         * @param {string} options.cancelText
         * @param {string} options.confirmText
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.openConfirm = function (options, onSuccess, onError) {
            this.validate(options, 'object', '');
            return this.method({
                name: 'confirm',
                params: options,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Opens a confirm window asking the user to confirm their unsaved changes.
         *
         * @param onSuccess
         * @param onError
         * @returns {*}
         */
        this.confirmUnsavedChanges = function (onSuccess, onError) {
            return this.method({
                name: 'unsavedChanges',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Uses Filepicker upload interface and Enplug encoding service, returns uploaded object
         *
         * @param {Object} options - Filepicker options
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.upload = function (options, onSuccess, onError) {
            return this.method({
                name: 'upload',
                params: options,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };
    }

    DashboardSender.prototype = Object.create(enplug.classes.Sender.prototype);

    enplug.classes.DashboardSender = DashboardSender;
    enplug.dashboard = new DashboardSender();

    // Broadcast clicks up to parent window so that we can
    // react to clicks for things like closing nav dropdowns
    document.addEventListener('click', function () {
        enplug.dashboard.click();
        return true;
    }, false);
}(window.enplug, document));
