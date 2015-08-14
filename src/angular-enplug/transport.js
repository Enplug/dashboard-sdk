angular.module('enplug.sdk').factory('$enplugTransport', ['$log', '$timeout', '$q', function ($log, $timeout, $q) {

    var targetDomain = '*',
        targetOrigin = targetDomain,
        callId = 0,
        pendingCalls = {};

    function debug(msg) {
    //        console.log('[Enplug SDK]: ' + msg);
    }

    function isValidJson(string) {
        try {
            var o = JSON.parse(JSON.stringify(JSON.parse(string)));
            if (o && typeof o === 'object' && o !== null) {
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    var service = {
        sendMessage: function (message) {
            debug('Sending message:' + message);
            var callerWindow = window.parent;
            callerWindow.postMessage(message, targetOrigin);
        },

        receiveMessage: function (event) {
            // Todo can implement everything except promises and timeout in native JS, then extend those methods using
            // angularjs principles

            // Notify Angular of changes
            $timeout(function () {
                if ((targetDomain !== '*') && (event.origin !== targetOrigin)) {
                    debug('Wrong origin.');
                    return;
                }

                if (isValidJson(event.data)) {
                    var response = JSON.parse(event.data);
                    if (typeof response.callId === 'number') {
                        debug('CLIENT received message: ' + event.data);

                        var responseCallId = response.callId,
                            success = response.success,
                            result = response.data;

                        if (pendingCalls[responseCallId]) {
                            debug('Found callbacks');
                            var methodCall = pendingCalls[responseCallId];
                            if (!methodCall.persistent) {
                                delete pendingCalls[responseCallId];
                            }

                            if (success) {
                                debug('Success callback.');
                                if (typeof methodCall.successCallback === 'function') {
                                    methodCall.successCallback(result);
                                }

                                if (methodCall.defer) {
                                    methodCall.defer.resolve(result);
                                }

                            } else {
                                debug('Error callback.');
                                if (result) {
                                    console.error('[SDK] Error:', result);
                                }
                                if (typeof methodCall.errorCallback === 'function') {
                                    methodCall.errorCallback(result);
                                }

                                if (methodCall.defer) {
                                    methodCall.defer.reject(result);
                                }
                            }
                        }
                    }
                }
            });
        },

        callMethod: function (methodCall) {
            debug('Calling method:' + methodCall.name);
            methodCall.callId = callId++;
            methodCall.defer = $q.defer();
            if (!methodCall.transient) {
                pendingCalls[methodCall.callId] = methodCall;
            }
            var json = JSON.stringify(methodCall);
            this.sendMessage(json);
            return methodCall.defer.promise;
        }
    };

    window.addEventListener('message', service.receiveMessage, false);
    return service;
}]);
