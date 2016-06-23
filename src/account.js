(function (enplug) {
    'use strict';

    /**
     * Communicates with the parent dashboard to load and modify a user's
     * account settings, app definition, and current app instance.
     *
     * @class
     * @extends Sender
     */
    function AccountSender() {

        // Call parent constructor with namespace
        enplug.classes.Sender.call(this, 'app');

        /**
         * Loads all information for the current user. App instance ID,
         * account type, token, account ID, venue ID, and environment.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getAccount = function (onSuccess, onError) {
            return this.method({
                name: 'getAccount',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Loads information for the currently selected display group.
         * Language, orientation and time zone.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getDisplayGroup = function (onSuccess, onError) {
            return this.method({
                name: 'getDisplay',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Loads an array of app instances including assets that are available for the
         * current app on a chain account.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {string} accountId
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getInstances = function (accountId, onSuccess, onError) {
            this.validate(accountId, 'string', 'Missing account ID (string).');
            return this.method({
                name: 'getInstances',
                params: accountId,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /***************
         * ASSETS
         ***************/

        /**
         * Loads an array of assets for the current app instance.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getAssets',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Creates an asset under the current app instance.
         *
         * @param {{Value:*, SecureValue:*}[]} asset -- the asset as an array or single asset object
         * @param {object} [dialogOptions] -- options for the asset deployment dialog
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.createAsset = function (assets, dialogOptions, onSuccess, onError) {
            var params = {};

            this.validate(assets, 'object', 'You must provide an asset (object or array) when creating an asset.');

            // wrap values in an array
            if (!Array.isArray(assets)) {
                params.assets = [assets];
            } else {
                params.assets = assets;
            }

            if (dialogOptions == null) {
                params.dialogOptions = {};
            } else {
                params.dialogOptions = dialogOptions;
            }

            return this.method({
                name: 'createAsset',
                params: params,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Updates an asset under the current app instance.
         *
         * @param {string} id - the Asset ID
         * @param {object} value - the new Asset Value
         * @param {object} [secureValue] - the new Asset Secure Value
         * @param {object} [dialogOptions] - options to be passed to the deployment dialog
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.updateAsset = function (id, value, secureValue, dialogOptions, onSuccess, onError) {
            this.validate(id, 'string', 'You must provide the ID (string) of an asset to update.');
            this.validate(value, 'object', 'You must provide the new value (object) of an asset to update.');
            return this.method({
                name: 'updateAsset',
                params: {
                    assetId: id,
                    value: value,
                    secureValue: secureValue || null,
                    dialogOptions: dialogOptions || null,
                },
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Removes an asset for the current app instance.
         *
         * @param {string|Array<string>} id - The ID of the asset to remove.
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.removeAsset = function (id, onSuccess, onError) {
            if (!Array.isArray(id)) {
                this.validate(id, 'string', 'You must provide the ID (string) of the asset to remove.');
                id = [id];
            } else {
                this.validate(id, 'array', 'You must pass a single ID (string) or Array of asset IDs to be removed.');
                this.validate(id[0], 'string', 'You must provide at least one Asset ID (string) to be removed.');
            }

            return this.method({
                name: 'removeAsset',
                params: {
                    ids: id
                },
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Loads an array of default assets for the current instance's app definition.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getDefaultAssets = function (onSuccess, onError) {
            return this.method({
                name: 'getDefaultAssets',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Creates an asset under the current app instance from a default asset definition.
         *
         * @param {string} defaultAssetId
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.createAssetFromDefault = function (defaultAssetId, onSuccess, onError) {
            this.validate(defaultAssetId, 'string', 'Missing default asset ID (string).');
            return this.method({
                name: 'createAssetFromDefault',
                params: defaultAssetId,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Creates one or more assets under the current app instance.
         *
         * If an asset object doesn't provide an AppInstanceId,
         * it will default to the current app instance.
         *
         * @param {{ AppInstanceId:string, AssetName:string, Value:Object }[]} assets
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.bulkCreateAssets = function (assets, onSuccess, onError) {
            // todo update
            this.validate(assets, 'object', 'You must provide an array of assets to bulk create.');
            return this.method({
                name: 'bulkCreateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Updates one or more assets under the current app instance.
         *
         * If an asset object doesn't provide an AppInstanceId,
         * it will default to the current app instance.
         *
         * @param {{ AppInstanceId:string, AssetId:string, Value:Object }[]} assets
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.bulkUpdateAssets = function (assets, onSuccess, onError) {
            // todo update
            this.validate(assets, 'object', 'You must provide an array of assets to bulk update.');
            return this.method({
                name: 'bulkUpdateAssets',
                params: assets,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Removes one or more assets.
         *
         * Provide an array of asset IDs to be removed for the current instance,
         * or an array of objects each with an AppInstanceId and AssetId.
         *
         * @param {string[]|{ AppInstanceId:string, AssetId:string }[]} assetIds
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.bulkRemoveAssets = function (assetIds, onSuccess, onError) {
            // todo update
            this.validate(assetIds, 'object', 'You must provide an array of asset IDs to bulk remove.');
            return this.method({
                name: 'bulkRemoveAssets',
                params: assetIds,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /***************
         * THEMES
         ***************/

        /**
         * Loads available themes for the current app instance app definition.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getThemes = function (onSuccess, onError) {
            return this.method({
                name: 'getThemes',
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Creates a new theme under the current app instance app definition.
         * The new theme will be available only under the current user's account.
         *
         * @param {object} newTheme
         * @param {string} newTheme.Name
         * @param {Array} newTheme.Assets
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.createTheme = function (newTheme, onSuccess, onError) {
            this.validate(newTheme, 'object', 'You must provide the new theme (object) to create.');
            return this.method({
                name: 'createTheme',
                params: newTheme,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Removes a theme from the current user's account for
         * the current app instance app definition. Cannot remove default themes.
         *
         * @param {string} themeId
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.removeTheme = function (themeId, onSuccess, onError) {
            this.validate(themeId, 'string', 'You must provide the ID (string) of the theme to remove.');
            return this.method({
                name: 'removeTheme',
                params: themeId,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Activates a theme for the current app instance.
         *
         * @param {string} themeId
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.activateTheme = function (themeId, onSuccess, onError) {
            this.validate(themeId, 'string', 'You must provide the ID (string) of the theme to activate.');
            return this.method({
                name: 'activateTheme',
                params: themeId,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * @deprecated
         */
        this.getDisplay = this.getDisplayGroup;
    }

    // Inherit
    AccountSender.prototype = Object.create(enplug.classes.Sender.prototype);

    // Export
    enplug.classes.AccountSender = AccountSender;
    enplug.account = new AccountSender();
}(window.enplug));
