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
