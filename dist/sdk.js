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

    // Validate and assign defaults for callback methods
    function validateCallbacks(options) {
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

                if (!options.transient) {

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
         */
        factory: function (context, prefix) {
            context.method = function (options) {
                validateCallbacks(options);

                // Add implementation-specific method prefix (dashboard or app)
                options.name = prefix + '.' + options.name;

                return enplug.transport.send(options);
            };

            return context;
        }
    };

    // Receive parent window response messages
    window.addEventListener('message', receiveFromParent, false);
}(window));

(function (enplug) {
    'use strict';

    var methodPrefix = 'account';

    enplug.account = enplug.transport.factory({

        getAccount: function (onSuccess, onError) {
            return this.method({
                name: 'getAccount',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        getDisplayGroup: function (onSuccess, onError) {
            return this.method({
                name: 'getDisplay',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        getInstances: function (accountId, onSuccess, onError) {
            return this.method({
                name: 'getInstances',
                params: accountId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        getAssets: function (onSuccess, onError) {
            return this.method({
                name: 'getAssets',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        getDefaultAssets: function () {
            var methodCall = { name: 'app.getDefaultAssets' };
            return transport.callMethod(methodCall);
        },

        createAsset: function (name, value) {
            var methodCall = {
                name: 'app.createAsset',
                params: [name, value]
            };
            return transport.callMethod(methodCall);
        },

        createAssetFromDefault: function (defaultAssetId) {
            var methodCall = {
                name: 'app.createAssetFromDefault',
                params: defaultAssetId
            };
            return transport.callMethod(methodCall);
        },

        /**
         *
         * @param id
         * @param value
         * @param {...requestCallback} callbacks
         * @returns {*}
         */
        updateAsset: function (id, value, callbacks) {
            var methodCall = {
                name: 'app.updateAsset',
                params: [id, value]
            };
            return transport.callMethod(methodCall);
        },

        bulkCreateAssets: function (assets) {
            var methodCall = {
                name: 'app.bulkCreateAssets',
                params: assets
            };
            return transport.callMethod(methodCall);
        },

        bulkUpdateAssets: function (assets) {
            var methodCall = {
                name: 'app.bulkUpdateAssets',
                params: assets
            };
            return transport.callMethod(methodCall);
        },

        bulkRemoveAssets: function (assetIds) {
            var methodCall = {
                name: 'app.bulkRemoveAssets',
                params: assetIds
            };
            return transport.callMethod(methodCall);
        },

        removeAsset: function (id) {
            var methodCall = {
                name: 'app.removeAsset',
                params: [id]
            };
            return transport.callMethod(methodCall);
        },

        getThemes: function () {
            var methodCall = { name: 'app.getThemes' };
            return transport.callMethod(methodCall);
        },

        createTheme: function (newTheme) {
            var methodCall = {
                name: 'app.createTheme',
                params: newTheme
            };
            return transport.callMethod(methodCall);
        },

        removeTheme: function (themeId) {
            var methodCall = {
                name: 'app.removeTheme',
                params: themeId
            };
            return transport.callMethod(methodCall);
        },

        activateTheme: function (themeId) {
            var methodCall = {
                name: 'app.activateTheme',
                params: themeId
            };
            return transport.callMethod(methodCall);
        }
    }, methodPrefix);

    /**
     * @deprecated
     */
    enplug.account.getDisplay = enplug.account.getDisplayGroup;
}(window.enplug));

(function (angular, enplug) {
    'use strict';

    function alias(original) {
        var service = {};
        for (var property in original) {
            if (original.hasOwnProperty(property)) {
                service[property] = original[property];
            }
        }

        return service;
    }

    /**
     * Sets up enplug.sdk module and associated services
     * if angular is loaded on the page.
     */
    if (angular) {

        var module = angular.module('enplug.sdk', []);

        // Modify the transport.send function to return a promise
        // which will be resolved/rejected by the callbacks
        module.config(function () {
            var q = angular.injector(['ng']).get('$q');

            // Override the send method to intercept callbacks
            var send = enplug.transport.send;
            enplug.transport.send = function (options) {

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
                send.call(enplug.transport, options);
                return defer.promise;
            };
        });

        module.factory('$enplugDashboard', function () {
            return alias(enplug.dashboard);
        });

        module.factory('$enplugAccount', function () {
            return alias(enplug.account);
        });
    }
}(window.angular, window.enplug));

(function (enplug, document) {
    'use strict';

    var methodPrefix = 'dashboard', // namespace for SDK calls

        // The buttons most recently registered with the dashboard header.
        // kept here so that we can respond to click events
        currentButtons = [],

        // Keeps track of whether the dashboard is loading mode so clients can check.
        isLoading = true;

    function validate(data, expectedType, errorMessage) {
        if (!data || typeof data !== expectedType) {
            throw new Error(errorMessage);
        }
    }

    /**
     * API for using UI componenets from the Enplug dashboard.
     * @typedef enplug.dashboard
     */
    enplug.dashboard = enplug.transport.factory({

        click: function () {
            return this.method({
                name: 'click',
                transient: true // don't wait for a response
            })
        },

        setHeaderTitle: function (title, onSuccess, onError) {
            validate(title, 'string', '');
            return this.method({
                name: 'set.title',
                params: title,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        setHeaderButtons: function (buttons, onSuccess, onError) {
            validate(buttons, 'object', '');

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
        },

        pageLoading: function (bool, onSuccess, onError) {
            validate(bool, 'boolean', '');
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
        },

        isLoading: function () {
            return isLoading;
        },

        pageError: function (onSuccess, onError) {
            return this.method({
                name: 'page.error',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        pageNotFound: function (onSuccess, onError) {
            return this.method({
                name: 'page.notFound',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        loadingIndicator: function (message, onSuccess, onError) {
            validate(message, 'object', '');
            return this.method({
                name: 'indicator.loading',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        successIndicator: function (message, onSuccess, onError) {
            validate(message, 'string', '');
            return this.method({
                name: 'indicator.success',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        errorIndicator: function (message, onSuccess, onError) {
            validate(message, 'string', '');
            return this.method({
                name: 'indicator.error',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

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
        openConfirm: function (options, onSuccess, onError) {
            validate(options, 'object', '');
            return this.method({
                name: 'confirm',
                params: options,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        /**
         * Opens a confirm window asking the user to confirm their unsaved changes.
         *
         * @param onSuccess
         * @param onError
         * @returns {*}
         */
        confirmUnsavedChanges: function (onSuccess, onError) {
            return this.method({
                name: 'unsavedChanges',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        /**
         * Uses Filepicker upload interface and Enplug encoding service, returns uploaded object
         *
         * @param {Object} options - Filepicker options
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        upload: function (options, onSuccess, onError) {
            return this.method({
                name: 'upload',
                params: options,
                successCallback: onSuccess,
                errorCallback: onError
            });
        }
    }, methodPrefix);

    // Broadcast clicks up to parent window so that we can
    // react to clicks for things like closing nav dropdowns
    document.addEventListener('click', function () {
        enplug.dashboard.click();
        return true;
    }, false);
}(window.enplug, document));
