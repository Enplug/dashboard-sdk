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
         * Loads all information for the current user.
         *
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number}
         */
        this.getUser = function (onSuccess, onError) {
            return this.method({
                name: 'getUser',
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
        this.getDisplayGroups = function (onSuccess, onError) {
            return this.method({
                name: 'getDisplays',
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
         * @param {{Value:*, SecureValue:*}[]} assets -- the asset as an array or single asset object
         * @param {object} [dialogOptions] -- options for the asset deployment dialog
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.createAsset = function (assets, dialogOptions, onSuccess, onError) {
            var params = {};

            // wrap values in an array
            if (!Array.isArray(assets)) {
                params.assets = [assets];
            } else {
                params.assets = assets;
            }

            this.validate(params.assets, 'array', 'You must provide an array of assets (object) when creating new assets.');
            this.validate(params.assets[0], 'object', 'You must provide an array of assets (object) when creating new assets.');
            if (params.assets[0]) {
                this.validate(params.assets[0].Value, 'object', 'You must provide a Value (object) when creating an asset.');
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
         * @param {string} asset - the asset being updated
         * @param {object} [dialogOptions] - options to be passed to the deployment dialog
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.updateAsset = function (asset, dialogOptions, onSuccess, onError) {
            this.validate(asset, 'object', 'You must provide an asset object to update.');
            if (asset) {
                this.validate(asset.Id, 'string', 'You must provide the ID (string) on the asset you want to update.');
                this.validate(asset.Value, 'object', 'You must provide the new value (object) of the asset to update.');
            }

            return this.method({
                name: 'updateAsset',
                params: {
                    asset: asset,
                    dialogOptions: dialogOptions || null,
                },
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * This is for saving an order of assets if needed for the current app. An array of asset Ids
         * is all that is needed, but the implementation also accepts an array of asset objects with "Id" string properties.
         *
         * @param {string[]|asset[]} assets -- an ordered array of assets or asset ids to be saved.
         * @param onSuccess
         * @param onError
         * @returns {number}
         */
        this.updateAssetOrder = function (assets, onSuccess, onError) {
            this.validate(assets, 'array', 'You must provide an array of assets (or asset ids) in the new order.');

            return this.method({
                name: 'updateAssetOrder',
                params: {
                    assets: assets,
                },
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };

        /**
         * Deletes an asset for the current app instance.
         *
         * @param {string|Array<string>} id - The ID of the asset to delete.
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.deleteAsset = function (id, onSuccess, onError) {
            if (!Array.isArray(id)) {
                this.validate(id, 'string', 'You must provide the ID (string) of the asset to delete.');
                id = [id];
            } else {
                this.validate(id, 'array', 'You must pass a single ID (string) or Array of asset IDs to be deleted.');
                this.validate(id[0], 'string', 'You must provide at least one Asset ID (string) to be deleted.');
            }

            return this.method({
                name: 'deleteAsset',
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
        this.getDisplay = this.getDisplayGroups;
        this.getDisplays = this.getDisplayGroups;
        this.getDisplayGroup = this.getDisplayGroups;
    }

    // Inherit
    AccountSender.prototype = Object.create(enplug.classes.Sender.prototype);

    // Export
    enplug.classes.AccountSender = AccountSender;
    enplug.account = new AccountSender();
}(window.enplug));
