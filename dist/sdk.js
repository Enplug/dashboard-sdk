// Transport layer (shared between client and host) and rpc proxy
// It's one way only, since right now we don't need the reverse
//

var enplug = window.enplug || (window.enplug = {});

enplug.debug = function (msg) {
    //  console.log('[Enplug SDK]: ' + msg);
};

enplug.extend = function (obj) {
    for (var attrname in obj) {
        if (obj.hasOwnProperty(attrname)) {
            this[attrname] = obj[attrname];
        }
    }
    return this;
};

enplug.isValidJson = function (string) {
    try {
        var o = JSON.parse(JSON.stringify(JSON.parse(string)));
        if (o && typeof o === 'object' && o !== null) {
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
};

enplug.Transport = function (targetDomain) {
    'use strict';
    var targetOrigin = targetDomain,
        callId = 0,
        pendingCalls = {};

    return {
        sendMessage: function (message) {
            enplug.debug('Sending message:' + message);
            var callerWindow = window.parent;
            callerWindow.postMessage(message, targetOrigin);
        },

        receiveMessage: function (event) {
            if ((targetDomain !== '*') && (event.origin !== targetOrigin)) {
                enplug.debug('Wrong origin.');
                return;
            }
            enplug.debug('CLIENT received message: ' + event.data);
            if (enplug.isValidJson(event.data)) {
                var response = JSON.parse(event.data);
                // This is client only, assumption is it can only receive responses
                var responseCallId = response.callId,
                    success = response.success,
                    result = response.data;

                if (responseCallId in pendingCalls) {
                    enplug.debug('Found callbacks');
                    var methodCall = pendingCalls[responseCallId];

                    delete pendingCalls[responseCallId];

                    if (success && typeof(methodCall.successCallback) === 'function') {
                        methodCall.successCallback(result);
                    } else if (!success && typeof(methodCall.errorCallback) === 'function') {
                        methodCall.errorCallback(result);
                    }
                }
            } else {
                enplug.debug('Error: response is not valid JSON.');
            }
        },

        callMethod: function (methodCall) {
            enplug.debug('Calling method:' + methodCall.name);
            methodCall.callId = callId++;
            console.log('callback', methodCall);
            if (typeof(methodCall.successCallback) === 'function' || typeof(methodCall.errorCallback) === 'function') {
                enplug.debug('Has callback!');
                pendingCalls[methodCall.callId] = methodCall;
            }

            var json = JSON.stringify(methodCall);
            this.sendMessage(json);
        }
    };
};

// Enplug SDK API
enplug.Apps = function () {
    'use strict';
    // this should be enplug.com
    var transport = new enplug.Transport('*');

    return {

        init: function () {
            enplug.debug('Enplug init');
            window.addEventListener('message', transport.receiveMessage, false);
        },

        getAccount: function (successCallback, errorCallback) {
            var methodCall = { name: 'getAccount', successCallback: successCallback, errorCallback: errorCallback };
            transport.callMethod(methodCall);
        },

        getAssets: function (successCallback, errorCallback) {
            var methodCall = { name: 'getAssets', successCallback: successCallback, errorCallback: errorCallback };
            transport.callMethod(methodCall);
        },

        createAsset: function (name, value, successCallback, errorCallback) {
            var methodCall = {
                name: 'createAsset',
                params: [name, value],
                successCallback: successCallback,
                errorCallback: errorCallback
            };
            transport.callMethod(methodCall);
        },

        updateAsset: function (id, value, successCallback, errorCallback) {
            var methodCall = {
                name: 'updateAsset',
                params: [id, value],
                successCallback: successCallback,
                errorCallback: errorCallback
            };
            transport.callMethod(methodCall);
        },

        removeAsset: function (id, successCallback, errorCallback) {
            var methodCall = {
                name: 'removeAsset',
                params: [id],
                successCallback: successCallback,
                errorCallback: errorCallback
            };
            transport.callMethod(methodCall);
        },

        close: function () {
            enplug.debug('Closing window');
            window.removeEventListener('message', transport.receiveMessage, false);
            var methodCall = { name: 'close' };
            transport.callMethod(methodCall);
        }
    };
};

// Initialize
enplug.extend(new enplug.Apps()).init();
