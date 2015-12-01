angular.module('enplug.sdk').factory('$enplugDashboard', function ($log, $enplugTransport, $document) {

    var transport = $enplugTransport,

        // Namespacing for SDK calls
        methodPrefix = 'dashboard.',

        // The buttons most recently registered with the dashboard header.
        // kept here so that we can respond to click events
        currentButtons = [],

        // Keeps track of whether the dashboard is loading mode so clients can check.
        isLoading = true;

    // Convenience method for namespacing SDK calls
    function callMethod(method) {
        method.name = methodPrefix + method.name;
        return transport.callMethod(method);
    }

    // Broadcast clicks up to parent window so that we can react to clicks for things like
    // closing nav dropdowns
    $document.on('click', function () {
        callMethod({
            name: 'click',
            transient: true // don't wait for a response
        });
        return true;
    });

    return {

        setHeaderTitle: function (title) {
            var method = {
                name: 'set.title',
                params: title
            };
            return callMethod(method);
        },

        setHeaderButtons: function (buttons) {

            // Reset any buttons we may have stored
            currentButtons = [];

            // Allow single button or multiple
            buttons = Array.isArray(buttons) ? buttons : [buttons];
            buttons.forEach(function (button) {

                // The button ID is used to identify which button was clicked in this service
                button.id = 'button-' + (Math.round(Math.random() * (10000 - 1) + 1));
                currentButtons[button.id] = button;
            });

            var method = {
                name: 'set.buttons',
                params: buttons,
                persistent: true,
                successCallback: function (clicked) {
                    if (clicked) {
                        var button = currentButtons[clicked.id];
                        button.action();
                    }
                }
            };
            return callMethod(method);
        },

        pageLoading: function (bool) {
            var method = {
                name: 'page.loading',
                params: bool
            };
            return callMethod(method).then(function () {
                isLoading = bool;
            });
        },

        isLoading: function () {
            return isLoading;
        },

        pageError: function () {
            var method = {
                name: 'page.error'
            };
            return callMethod(method);
        },

        pageNotFound: function () {
            var method = {
                name: 'page.notFound'
            };
            return callMethod(method);
        },

        loadingIndicator: function (msg) {
            var method = {
                name: 'indicator.loading',
                params: msg
            };
            return callMethod(method);
        },

        successIndicator: function (msg) {
            var method = {
                name: 'indicator.success',
                params: msg
            };
            return callMethod(method);
        },

        errorIndicator: function (msg) {
            var method = {
                name: 'indicator.error',
                params: msg
            };
            return callMethod(method);
        },

        /**
         *
         * @param opts - title, text, cancelText, confirmText
         * @returns {*}
         */
        openConfirm: function (opts) {
            var method = {
                name: 'confirm',
                params: opts
            };
            return callMethod(method);
        },

        confirmUnsavedChanges: function () {
            var method = {
                name: 'unsavedChanges'
            };
            return callMethod(method);
        },

        /**
         * Uses Filepicker upload interface and Enplug encoding service, returns uploaded object
         * @param options - Filepicker options
         * @returns {*}
         */
        upload: function (options) {
            var methodCall = {
                name: 'upload',
                params: options
            };
            return transport.callMethod(methodCall);
        }
    };
});
