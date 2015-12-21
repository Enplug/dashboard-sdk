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
        }
    }

    /**
     * Creates a new {@link Sender} to be used as an AngularJS service.
     *
     * @param {string} type - Sender type to create.
     */
    function createSender(type) {
        var className = type.charAt(0).toUpperCase() + type.slice(1) + 'Sender',
            sender = new enplug.classes[className]();

        // Remove event listeners for existing sender and reassign
        enplug[type].cleanup();
        enplug[type] = sender;
        return sender;
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

        module.factory('$enplugDashboard', function ($q, $rootScope) {
            var sender = createSender('dashboard');
            decorateSend($q, $rootScope, sender.transport);
            return sender;
        });

        module.factory('$enplugAccount', function ($q, $rootScope) {
            var sender = createSender('account');
            decorateSend($q, $rootScope, sender.transport);
            return sender;
        });
    }
}(window.angular, window.enplug));
