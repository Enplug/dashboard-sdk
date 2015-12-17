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
