(function (window) {
    'use strict';

    window.enplug = {
        debug: false,
        classes: {},
        noop: function () {},
    };
}(window));

(function (enplug) {
    'use strict';

    /**
     * Used in debug log statements.
     * @type {string}
     */
    var TAG = '[Enplug SDK] ';

    /**
     * Transports are used to communicate with the dashboard parent window.
     * All calls are asynchronous RPC.
     *
     * @param window
     * @param {string} namespace - Determines which events a transport responds to.
     * @constructor
     * @implements EventListener
     */
    function Transport(window, namespace) {

        /**
         * Set to * to support various developer localhosts
         * @type {string}
         */
        var targetOrigin = '*';

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
                            response: response,
                        });

                        var cb = response.success ? methodCall.successCallback : methodCall.errorCallback;
                        cb(response.data);

                        return true;
                    }
                }
            }

            return false;
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
}(window.enplug));

(function (window, enplug) {
    'use strict';

    /**
     * Base class for sending messages using a {@link Transport} to the parent window (dashboard).
     *
     * @param {string} prefix - The namespace for the sender's {@link Transport}.
     * @class
     */
    function Sender(prefix) {
        if (!prefix) {

            // Transports can't work without a prefix/namespace
            throw new Error(enplug.classes.Transport.prototype.TAG + 'Senders must specify a method prefix.');
        }

        /**
         * {@link Transport} namespace.
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
                if (data == null || ((expectedType === 'array') ? !Array.isArray(data) : typeof data !== expectedType)) {
                    throw new Error(this.transport.TAG + errorMessage);
                }
            }
        },

        /**
         * Factory for all SDK method calls.
         *
         * @param {MethodCall|*} options
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
         * Removes this sender's {@link Transport} event listeners to prevent memory leaks.
         */
        cleanup: function () {
            this.transport.cleanup();
        },
    };

    // Export
    enplug.classes.Sender = Sender;
}(window, window.enplug));

(function (enplug) {
    'use strict';

    /**
     * Communicates with the parent dashboard to load and modify a user's
     * account settings, app definition, and current app instance.
     *
     * @class
     * @extends Sender
     */
    function AccountSender() {

        // Call parent constructor with namespace
        enplug.classes.Sender.call(this, 'app');

        /**
         * Loads all information for the current user. App instance ID,
         * account type, token, account ID, venue ID, and environment.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getAccount = function (onSuccess, onError) {
            return this.method({
                name: 'getAccount',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Loads all information for the current user.
         *
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number}
         */
        this.getUser = function (onSuccess, onError) {
            return this.method({
                name: 'getUser',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Loads information for the display groups available in current view.
         * In the Display Group view it will return currently selected Display Group.
         * In Account view it will return all DisplayGroups in the account.
         * Language, orientation and time zone.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getDisplayGroups = function (onSuccess, onError) {
            return this.method({
                name: 'getDisplays',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Loads information for the display groups available in current view.
         * Language, orientation and time zone.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getSelectedDisplayId = function (onSuccess, onError) {
            return this.method({
                name: 'getSelectedDisplayId',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /***************
         * ASSETS
         ***************/

        /**
         * Loads an array of assets for the current app instance.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getAssets',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Creates an asset under the current app instance.
         *
         * @param {{Value:*, SecureValue:*}[]} assets -- the asset as an array or single asset object
         * @param {object} [dialogOptions] -- options for the asset deployment dialog
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.bulkCreateAssets = function (assets, dialogOptions, onSuccess, onError) {
            var params = {
                assets : assets,
                dialogOptions : dialogOptions || {}
            };

            this.validate(params.assets, 'array', 'You must provide an array of assets (object) when creating new assets.');
            this.validate(params.assets[0], 'object', 'You must provide an array of assets (object) when creating new assets.');
            if (params.assets[0]) {
                this.validate(params.assets[0].Value, 'object', 'You must provide a Value (object) when creating an asset.');
            }

            return this.method({
                name: 'bulkCreateAssets',
                params: params,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Creates an asset under the current app instance.
         *
         * @param {{Value:*, SecureValue:*}[]} assets -- the asset as an array or single asset object
         * @param {object} [dialogOptions] -- options for the asset deployment dialog
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.bulkDeployAssets = function (assets, dialogOptions, onSuccess, onError) {
            var params = {
                assets : assets,
                dialogOptions : dialogOptions || {}
            };

            this.validate(params.assets, 'array', 'You must provide an array of assets (object) when deploying assets.');
            this.validate(params.assets[0], 'object', 'You must provide an array of assets (object) when deploying assets.');
            if (params.assets[0]) {
                this.validate(params.assets[0].Value, 'object', 'You must provide a Value (object) when deploying an asset.');
                this.validate(params.assets[0].Id, 'string', 'You must provide the ID (string) on the asset you want to update.');
            }

            return this.method({
                name: 'bulkDeployAssets',
                params: params,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };


        /**
         * Saves an asset without showing the deployment dialog.
         * @param {{Value:*, SecureValue:*}[]} assets -- the asset as an array or single asset object
         * @param {object} [dialogOptions] -- options for the asset deployment dialog
         * @param {object} asset
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.saveAsset = function (asset, dialogOptions, onSuccess, onError) {
            this.validate(asset, 'object', 'You must provide an asset object to save.');

            var params = {
                asset : asset,
                dialogOptions : dialogOptions || {}
            };
            
            return this.method({
                name: 'saveAsset',
                params: params,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * This is for saving an order of assets if needed for the current app. An array of asset Ids
         * is all that is needed, but the implementation also accepts an array of asset objects with "Id" string properties.
         *
         * @param {string[]|asset[]} assets -- an ordered array of assets or asset ids to be saved.
         * @param onSuccess
         * @param onError
         * @returns {number}
         */
        this.updateAssetOrder = function (assets, onSuccess, onError) {
            this.validate(assets, 'array', 'You must provide an array of assets (or asset ids) in the new order.');

            return this.method({
                name: 'updateAssetOrder',
                params: {
                    assets: assets,
                },
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Deletes an asset for the current app instance.
         *
         * @param {string|Array<string>} id - The ID of the asset to delete.
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.deleteAsset = function (id, onSuccess, onError) {
            if (!Array.isArray(id)) {
                this.validate(id, 'string', 'You must provide the ID (string) of the asset to delete.');
                id = [id];
            } else {
                this.validate(id, 'array', 'You must pass a single ID (string) or Array of asset IDs to be deleted.');
                this.validate(id[0], 'string', 'You must provide at least one Asset ID (string) to be deleted.');
            }

            return this.method({
                name: 'deleteAsset',
                params: {
                    ids: id
                },
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Loads an array of default assets for the current instance's app definition.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getDefaultAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getDefaultAssets',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /***************
         * THEMES
         ***************/

        /**
         * Loads available themes for the current app or for specified appId.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} [appId]
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getThemes = function (appId, onSuccess, onError) {
            return this.method({
                name: 'getThemes',
                params: {
                    appId: appId
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Loads theme by id.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} [themeId]
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getTheme = function (themeId, onSuccess, onError) {
            return this.method({
                name: 'getTheme',
                params: {
                    id: themeId
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };


        /**
         * Creates a new theme under the current app instance app definition.
         * The new theme will be available only under the current user's account.
         *
         * @param {object} themeDefinition
         * @param {object} theme
         * @param {string} previewUrl
         * @param {Array} previewAsset
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.editTheme = function (themeDef, theme, previewUrl, previewAsset, fonts, onSuccess, onError) {
            this.validate(themeDef, 'object', 'You must provide the theme definition (object).');
            this.validate(previewUrl, 'string', 'You must provide the preview url (string).');
            return this.method({
                name: 'editTheme',
                params: {
                    themeDefinition: themeDef,
                    theme: theme,
                    previewUrl: previewUrl,
                    previewAsset: previewAsset,
                    fonts: fonts
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Creates a new theme under the current app definition.
         * The new theme will be available to all users in the account.
         *
         * @param {object} theme
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.saveTheme = function (theme, onSuccess, onError) {
            this.validate(theme, 'object', 'You must provide the theme (object) to save.');
            this.validate(theme.Value, 'object', 'You must provide the theme.Value (object) to save.');

            return this.method({
                name: 'saveTheme',
                params: {
                     theme : theme
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Deletes a theme from the current user's account for
         * the current app definition. Cannot remove default themes.
         *
         * @param {string} themeId
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.deleteTheme = function (themeId, onSuccess, onError) {
            this.validate(themeId, 'string', 'You must provide the ID (string) of the theme to remove.');
            return this.method({
                name: 'deleteTheme',
                params: {
                    themeId: themeId
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * @deprecated
         */
        this.getDisplay = this.getDisplayGroups;
        this.getDisplays = this.getDisplayGroups;
        this.getDisplayGroup = this.getDisplayGroups;
    }

    // Inherit
    AccountSender.prototype = Object.create(enplug.classes.Sender.prototype);

    // Export
    enplug.classes.AccountSender = AccountSender;
    enplug.account = new AccountSender();
}(window.enplug));

(function (enplug, document) {
    'use strict';

    /**
     * Controls the parent dashboard application. Exposes convenient UI controls to developers:
     *
     * - Page status: loading, error, 404.
     * - Loading indicator (with loading, success and error states)
     * - Confirm box with custom text
     * - Confirm unsaved changes box
     * - Change the page header title and buttons
     *
     * @class
     * @extends Sender
     */
    function DashboardSender() {

        // Call parent constructor with namespace
        enplug.classes.Sender.call(this, 'dashboard');

        /**
         * The buttons most recently registered with the dashboard header.
         * Stored locally so that we can respond to click events
         * @type {{ id:string, action:function, text:string, class:string }[]}
         */
        var currentButtons = [];

        /**
         * The last callback registered with the dashboard title bar.
         * @type {function}
         */
        var currentDisplayCallback = function () {};

        /**
         * Keeps track of whether the dashboard is loading mode so clients can check.
         * @type {boolean}
         */
        var isLoading = true;

        /**
         * Sets the last part of the title bar breadcrumb.
         * Set an empty title '' to clear the title.
         * Re-setting this value wipes out the old one.
         *
         * The home/default page for an app should have no title set.
         *
         * @param {string} title
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.setHeaderTitle = function (title, onSuccess, onError) {
            this.validate(title, 'string', 'Header title must be a string.');
            return this.method({
                name: 'set.title',
                params: title,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Sets the current callback for the title bar breadcrumb display selector dropdown.
         * Attaching a callback enables the dropdown, it is disabled by default.
         * The title is reset when the dashboard changes routes.
         *
         * the callback is fired when a display is selected, the callback will get the ID
         * value when a single display is fired, or null when the 'All' selection is selected
         *
         * @param {function} callback -- the callback to call when the display is changed
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.setDisplaySelectorCallback = function (callback, onError) {
            this.validate(callback, 'function', 'To enable the display selector in the page title you must supply a callback function.');

            // throw away previous callback
            currentDisplayCallback = callback;

            return this.method({
                name: 'set.selectorCallback',
                params: callback,
                persistent: true,
                successCallback: function (displayType) {
                    if (typeof currentDisplayCallback === 'function' && displayType !== undefined) {
                        currentDisplayCallback(displayType);
                    }

                    return displayType;
                },

                errorCallback: onError
            });
        };

        /**
         * Hides or shows the display dropdown selector in the page title breadcrumb bar.
         * Send true to show the selector, false to hide it.
         *
         * @param {boolean} show
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.setDisplaySelectorVisibility = function (show, onSuccess, onError) {
            this.validate(show, 'boolean', 'Setting the display selector visibility requires a boolean argument, true to show or false to hide.');

            return this.method({
                name: 'set.selectorEnabled',
                params: show,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Switches to account view aka "All" selection of instance selector or DisplayGroup view
         *
         * @param {boolean} displayGroupId
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.switchToView = function (displayGroupId, displayGroupName, onSuccess, onError) {
            var view = {
                displayGroupId : displayGroupId,
                displayGroupName : displayGroupName
            };

            return this.method({
                name: 'switchToView',
                params: view,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };


        /**
         * Sets the primary action buttons for a page in the titlebar.
         *
         * Accepts either a single button object, or an array of buttons.
         * Each button must have a button.action callback.
         *
         * @param {{ text:string, class:string, action:function, disabled:boolean }[]} buttons
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
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

        /**
         * Controls the loading state for the entire page. Every application starts off in
         * loading state, and must set pageLoading(false) to notify the dashboard that it
         * has successfully loaded.
         *
         * Use .isLoading() to synchronously check current loading state.
         *
         * @param {boolean} bool
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
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

        /**
         * Synchronously returns the current loading state.
         *
         * Updated asynchronously when this sender receives an acknowledgement
         * of successful SDK call from the dashboard.
         *
         * @returns {boolean} - Current loading state
         */
        this.isLoading = function () {
            return isLoading;
        };

        /**
         * Puts the page into error state.
         *
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.pageError = function (onSuccess, onError) {
            return this.method({
                name: 'page.error',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Puts the page into 404 state.
         *
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.pageNotFound = function (onSuccess, onError) {
            return this.method({
                name: 'page.notFound',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Turns on the progress indicator, typically used during asynchronous actions.
         *
         * Note that the progress indicator will continue until a call is made to the
         * errorIndicator or successIndicator APIs.
         *
         * @param {string} message
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.loadingIndicator = function (message, onSuccess, onError) {
            this.validate(message, 'string', 'Loading indicator requires a loading message (string)');
            return this.method({
                name: 'indicator.loading',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Shows the success indicator.
         *
         * Should only be used after a call has been made to .loadingIndicator().
         *
         * @param {string} message
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.successIndicator = function (message, onSuccess, onError) {
            this.validate(message, 'string', 'Success indicator requires a success message (string)');
            return this.method({
                name: 'indicator.success',
                params: message,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Shows the error indicator.
         *
         * Should only be used after a call has been made to .loadingIndicator().
         *
         * @param {string} message
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
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
         * If the user clicks the Confirm button, the success callback is called.
         * Otherwise the error callback is called.
         *
         * @param {Object} options
         * @param {string} options.title
         * @param {string} options.text
         * @param {string} [options.cancelText=Cancel]
         * @param {string} [options.confirmText=Confirm]
         * @param {string} [options.confirmClass=btn-primary]
         * @param {function} onSuccess
         * @param {function} [onError]
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
         * If the user clicks the confirm button, the success callback is called.
         * Otherwise the error callback is called.
         *
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.confirmUnsavedChanges = function (onSuccess, onError) {
            return this.method({
                name: 'unsavedChanges',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Opens app preview modal.
         *
         *
         * @param {string} url
         * @param {object} asset
         * @param {object} theme
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.preview = function (url, asset, theme, onSuccess, onError) {
            return this.method({
                name: 'preview',
                params: {
                    url :  url,
                    asset: asset,
                    theme: theme
                },
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
         * Removes event listeners to prevent memory leaks.
         */
        this.cleanup = function () {
            document.removeEventListener('click', listenToClicks, false);
            enplug.classes.Sender.prototype.cleanup.call(this);
        };

        /**
         * Notifies the parent dashboard of a click in the child iFrame. Used to close
         * dropdown windows etc which were opened in parent window and are unable to
         * respond to click events in child iFrame.
         *
         * Event handler is automatically bound when a DashboardSender is created.
         *
         * @returns {string} callId
         */
        this.click = function () {
            return this.method({
                name: 'click',
                transient: true // don't wait for a response
            });
        };

        // Broadcast clicks up to parent window so that we can
        // react to clicks for things like closing nav dropdowns
        var _this = this;
        function listenToClicks() {
            _this.click();
            return true;
        }

        document.addEventListener('click', listenToClicks, false);
    }

    // Inherit
    DashboardSender.prototype = Object.create(enplug.classes.Sender.prototype);

    // Export
    enplug.classes.DashboardSender = DashboardSender;
    enplug.dashboard = new DashboardSender();
}(window.enplug, document));

(function (angular, enplug) {
    'use strict';

    /**
     * Modifies transport.send to return promises.
     *
     * @param {Object} q
     * @param {Object} scope
     * @param {Object} transport
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
        };
    }

    /**
     * Creates a new {@link Sender} to be used as an AngularJS service.
     *
     * @param {string} senderType - Sender type to create.
     */
    function createService(senderType) {
        return (function (type) {

            // Angular service constructor
            return function ($q, $rootScope) {
                var className = type.charAt(0).toUpperCase() + type.slice(1) + 'Sender',
                    sender = new enplug.classes[className]();

                // Remove event listeners for existing sender and reassign
                enplug[type].cleanup();
                enplug[type] = sender;

                // Return promises
                decorateSend($q, $rootScope, sender.transport);
                return sender;
            };
        }(senderType));
    }

    /**
     * Automatically creates up enplug.sdk module and associated services
     * if angular is loaded on the page.
     *
     * The services $enplugDashboard and $enplugAccount are synchronized
     * with the global variables enplug.dashboard and enplug.account.
     */

    if (angular) {

        var module = angular.module('enplug.sdk', []);

        module.factory('$enplugDashboard', ['$q', '$rootScope', createService('dashboard')]);
        module.factory('$enplugAccount', ['$q', '$rootScope', createService('account')]);
    }
}(window.angular, window.enplug));
