(function (enplug) {
    'use strict';

    var methodPrefix = 'account';

    function validate(data, expectedType, errorMessage) {
        if (!data || typeof data !== expectedType || (expectedType === 'array' && !Array.isArray(data))) {
            throw new Error(errorMessage);
        }
    }

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
            validate(accountId, 'string', '');
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

        getDefaultAssets: function (onSuccess, onError) {
            return this.method({
                name: 'getDefaultAssets',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        createAsset: function (name, value, onSuccess, onError) {
            validate(name, 'string', '');
            validate(value, 'object', '');
            return this.method({
                name: 'createAsset',
                params: [name, value],
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        createAssetFromDefault: function (defaultAssetId, onSuccess, onError) {
            validate(defaultAssetId, 'string', '');
            return this.method({
                name: 'createAssetFromDefault',
                params: defaultAssetId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        updateAsset: function (id, value, onSuccess, onError) {
            validate(id, 'string', '');
            validate(value, 'object', '');
            return this.method({
                name: 'updateAsset',
                params: [id, value],
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        bulkCreateAssets: function (assets, onSuccess, onError) {
            validate(assets, 'array', '');
            return this.method({
                name: 'bulkCreateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        bulkUpdateAssets: function (assets, onSuccess, onError) {
            validate(assets, 'array', '');
            return this.method({
                name: 'bulkUpdateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        bulkRemoveAssets: function (assetIds, onSuccess, onError) {
            validate(assetIds, 'array', '');
            return this.method({
                name: 'bulkRemoveAssets',
                params: assetIds,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        removeAsset: function (id, onSuccess, onError) {
            validate(id, 'string', '');
            return this.method({
                name: 'removeAsset',
                params: [id],
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        getThemes: function (onSuccess, onError) {
            return this.method({
                name: 'getThemes',
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        createTheme: function (newTheme, onSuccess, onError) {
            validate(newTheme, 'object', '');
            return this.method({
                name: 'createTheme',
                params: newTheme,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        removeTheme: function (themeId, onSuccess, onError) {
            validate(themeId, 'string', '');
            return this.method({
                name: 'removeTheme',
                params: themeId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        },

        activateTheme: function (themeId, onSuccess, onError) {
            validate(themeId, 'string', '');
            return this.method({
                name: 'activateTheme',
                params: themeId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        }
    }, methodPrefix);

    /**
     * @deprecated
     */
    enplug.account.getDisplay = enplug.account.getDisplayGroup;
}(window.enplug));
