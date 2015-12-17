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
