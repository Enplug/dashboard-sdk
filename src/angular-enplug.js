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
