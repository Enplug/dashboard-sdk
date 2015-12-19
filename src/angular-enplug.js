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
