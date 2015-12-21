(function (window) {
    'use strict';

    var enplug = window.enplug || (window.enplug = { debug: false, classes: {}, noop: function () {} }),
        targetOrigin = '*', // this is set to * to support various developer localhosts
        tag = '[Enplug SDK] ';

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
         * @type {string}
         */
        this.namespace = namespace;

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
         * Verifies that a message is intended for the transport.
         * @param event
         * @returns {boolean}
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
         *
         */
        this.cleanup = function () {
            window.removeEventListener('message', this, false);
        };

        // Receive parent window response messages
        window.addEventListener('message', this, false);
    };
}(window));

(function (window, enplug) {
    'use strict';

    /**
     * @param prefix
     * @class
     */
    function Sender(prefix) {
        if (!prefix) {
            throw new Error('Senders must specify a method prefix.'); // Transports can't work without a prefix/namespace
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
                throw new Error('Transport options must be an object.');
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

(function (enplug) {
    'use strict';

    var methodPrefix = 'app';

    /**
     * Communicates with the parent dashboard to load and modify a user's
     * account settings, app definition, and current app instance.
     *
     * @class
     * @extends Sender
     */
    function AccountSender() {

        // Call parent constructor
        enplug.classes.Sender.call(this, methodPrefix);

        /**
         * Loads all information for the current user. App instance ID,
         * account type, token, account ID, venue ID, and environment.
         *
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.getAccount = function (onSuccess, onError) {
            return this.method({
                name: 'getAccount',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Loads information for the currently selected display group.
         * Language, orientation and time zone.
         *
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.getDisplayGroup = function (onSuccess, onError) {
            return this.method({
                name: 'getDisplay',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Loads an array of app instances including assets that are available for the
         * current app on a chain account.
         *
         * @param {string} accountId
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.getInstances = function (accountId, onSuccess, onError) {
            this.validate(accountId, 'string', 'Missing account ID (string).');
            return this.method({
                name: 'getInstances',
                params: accountId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Loads an array of assets for the current app instance.
         *
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.getAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getAssets',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Loads an array of default assets for the current instance's app definition.
         *
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.getDefaultAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getDefaultAssets',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Creates an asset under the current app instance.
         *
         * @param {string} name
         * @param {object} value
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
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

        /**
         * Creates an asset under the current app instance from a default asset definition.
         *
         * @param {string} defaultAssetId
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.createAssetFromDefault = function (defaultAssetId, onSuccess, onError) {
            this.validate(defaultAssetId, 'string', 'Missing default asset ID (string).');
            return this.method({
                name: 'createAssetFromDefault',
                params: defaultAssetId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Updates an asset under the current app instance.
         *
         * @param {string} id
         * @param {object} value
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
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

        /**
         * Creates one or more assets under the current app instance.
         *
         * If an asset object doesn't provide an AppInstanceId,
         * it will default to the current app instance.
         *
         * @param {Array<Object>} assets
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.bulkCreateAssets = function (assets, onSuccess, onError) {
            this.validate(assets, 'array', 'You must provide an array of assets to bulk create.');
            return this.method({
                name: 'bulkCreateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Updates one or more assets under the current app instance.
         *
         * If an asset object doesn't provide an AppInstanceId,
         * it will default to the current app instance.
         *
         * @param {Array<Object>} assets
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.bulkUpdateAssets = function (assets, onSuccess, onError) {
            this.validate(assets, 'array', 'You must provide an array of assets to bulk update.');
            return this.method({
                name: 'bulkUpdateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Removes one or more assets.
         *
         * Provide an array of asset IDs to be removed for the current instance,
         * or an array of objects each with an AppInstanceId and AssetId.
         *
         * @param {Array<string>|Array<Object>} assetIds
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.bulkRemoveAssets = function (assetIds, onSuccess, onError) {
            this.validate(assetIds, 'array', 'You must provide an array of asset IDs to bulk remove.');
            return this.method({
                name: 'bulkRemoveAssets',
                params: assetIds,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Removes an asset for the current app instance.
         *
         * @param {string} id
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.removeAsset = function (id, onSuccess, onError) {
            this.validate(id, 'string', 'You must provide the ID (string) of the asset to remove.');
            return this.method({
                name: 'removeAsset',
                params: [id],
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Loads available themes for the current app instance app definition.
         *
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.getThemes = function (onSuccess, onError) {
            return this.method({
                name: 'getThemes',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Creates a new theme under the current app instance app definition.
         * The new theme will be available only under the current user's account.
         *
         * @param {object} newTheme
         * @param {string} newTheme.Name
         * @param {Array} newTheme.Assets
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.createTheme = function (newTheme, onSuccess, onError) {
            this.validate(newTheme, 'object', 'You must provide the new theme (object) to create.');
            return this.method({
                name: 'createTheme',
                params: newTheme,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Removes a theme from the current user's account for
         * the current app instance app definition. Cannot remove default themes.
         *
         * @param {string} themeId
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.removeTheme = function (themeId, onSuccess, onError) {
            this.validate(themeId, 'string', 'You must provide the ID (string) of the theme to remove.');
            return this.method({
                name: 'removeTheme',
                params: themeId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Activates a theme for the current app instance.
         *
         * @param {string} themeId
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
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
     * @param scope
     * @param transport
     */
    function decorateSend(q, scope, transport) {
        var original = transport.send;
        transport.send = function (options) {

            // Store originals
            var defer = q.defer(),
                onSuccess = options.successCallback || angular.noop,
                onError = options.errorCallback || angular.noop;

            options.successCallback = function (result) {
                scope.$apply(function () {
                    defer.resolve(result);
                    onSuccess(result);
                });
            };

            options.errorCallback = function (result) {
                scope.$apply(function () {
                    defer.reject(result);
                    onError(result);
                });
            };

            // Call the original transport method
            // but use our promise as the return value
            original.call(transport, options);
            return defer.promise;
        }
    }

    /**
     * Sets up enplug.sdk module and associated services
     * if angular is loaded on the page.
     */
    if (angular) {

        var module = angular.module('enplug.sdk', []);

        module.factory('$enplugDashboard', function ($q, $rootScope) {
            var sender = new enplug.classes.DashboardSender();
            enplug.dashboard.cleanup();
            enplug.dashboard = sender;
            decorateSend($q, $rootScope, sender.transport);
            return sender;
        });

        module.factory('$enplugAccount', function ($q, $rootScope) {
            var sender = new enplug.classes.AccountSender();
            enplug.account.cleanup();
            enplug.account = sender;
            decorateSend($q, $rootScope, sender.transport);
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
            });
        };

        this.setHeaderTitle = function (title, onSuccess, onError) {
            this.validate(title, 'string', 'Header title must be a string.');
            return this.method({
                name: 'set.title',
                params: title,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.setHeaderButtons = function (buttons, onSuccess, onError) {
            this.validate(buttons, 'object', 'Header buttons must be an object (single) or array (multiple).');

            // Reset any buttons we may have stored
            currentButtons = [];

            // Allow single button or multiple
            buttons = Array.isArray(buttons) ? buttons : [buttons];

            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                this.validate(button, 'object', 'Header buttons must be objects.');
                if (button) {
                    this.validate(button.action, 'function', 'Header buttons must have an action (function).');

                    // The button ID is used to identify which button was clicked in this service
                    button.id = 'button-' + (Math.round(Math.random() * (10000 - 1) + 1));
                    currentButtons[button.id] = button;
                }
            }

            return this.method({
                name: 'set.buttons',
                params: buttons,
                persistent: true,
                successCallback: function (clicked) {
                    if (clicked) {
                        var button = currentButtons[clicked.id];
                        if (button) {
                            button.action();
                        } else {
                            console.warn('Unrecognized button click:', clicked);
                        }
                    }

                    if (typeof onSuccess === 'function') {
                        onSuccess(clicked);
                    }
                },
                errorCallback: onError
            });
        };

        this.pageLoading = function (bool, onSuccess, onError) {
            this.validate(bool, 'boolean', 'Page loading status must be a boolean.');
            return this.method({
                name: 'page.loading',
                params: bool,
                successCallback: function () {
                    isLoading = bool;
                    if (typeof onSuccess === 'function') {
                        onSuccess(isLoading);
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
            this.validate(message, 'string', 'Loading indicator requires a loading message (string)');
            return this.method({
                name: 'indicator.loading',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.successIndicator = function (message, onSuccess, onError) {
            this.validate(message, 'string', 'Success indicator requires a success message (string)');
            return this.method({
                name: 'indicator.success',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.errorIndicator = function (message, onSuccess, onError) {
            this.validate(message, 'string', 'Error indicator requires an error message (string)');
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
            this.validate(options, 'object', 'Confirm box requires options to be set (object).');

            if (options) {
                this.validate(options.title, 'string', 'Confirm box requires options.title to be set (string).');
                this.validate(options.text, 'string', 'Confirm box requires options.text to be set (string).');
            }

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

        /**
         *
         */
        this.cleanup = function () {
            document.removeEventListener('click', listenToClicks, false);
            enplug.classes.Sender.prototype.cleanup.call(this);
        };

        // Broadcast clicks up to parent window so that we can
        // react to clicks for things like closing nav dropdowns
        var self = this;
        function listenToClicks() {
            self.click();
            return true;
        }

        document.addEventListener('click', listenToClicks, false);
    }

    DashboardSender.prototype = Object.create(enplug.classes.Sender.prototype);

    enplug.classes.DashboardSender = DashboardSender;
    enplug.dashboard = new DashboardSender();
}(window.enplug, document));
