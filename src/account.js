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
         * Loads information for the display groups available in current view.
         * In the Display Group view it will return currently selected Display Group.
         * In Account view it will return all DisplayGroups in the account.
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
         * Loads information for the display groups available in current view.
         * Language, orientation and time zone.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getSelectedDisplayId = function (onSuccess, onError) {
            return this.method({
                name: 'getSelectedDisplayId',
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
         * Loads an array of assets for a specific app instance.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {string} appId
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getAssetsForApp = function (appId, onSuccess, onError) {
            return this.method({
                name: 'getAssetsForApp',
                appId: appId,
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
        this.bulkCreateAssets = function (assets, dialogOptions, onSuccess, onError) {
            var params = {
                assets : assets,
                dialogOptions : dialogOptions || {}
            };

            this.validate(params.assets, 'array', 'You must provide an array of assets (object) when creating new assets.');
            this.validate(params.assets[0], 'object', 'You must provide an array of assets (object) when creating new assets.');
            if (params.assets[0]) {
                this.validate(params.assets[0].Value, 'object', 'You must provide a Value (object) when creating an asset.');
            }

            return this.method({
                name: 'bulkCreateAssets',
                params: params,
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
        this.bulkDeployAssets = function (assets, dialogOptions, onSuccess, onError) {
            var params = {
                assets : assets,
                dialogOptions : dialogOptions || {}
            };

            this.validate(params.assets, 'array', 'You must provide an array of assets (object) when deploying assets.');
            this.validate(params.assets[0], 'object', 'You must provide an array of assets (object) when deploying assets.');
            if (params.assets[0]) {
                this.validate(params.assets[0].Value, 'object', 'You must provide a Value (object) when deploying an asset.');
                this.validate(params.assets[0].Id, 'string', 'You must provide the ID (string) on the asset you want to update.');
            }

            return this.method({
                name: 'bulkDeployAssets',
                params: params,
                successCallback: onSuccess,
                errorCallback: onError,
            });
        };


        /**
         * Saves an asset without showing the deployment dialog.
         * @param {{Value:*, SecureValue:*}[]} assets -- the asset as an array or single asset object
         * @param {object} [dialogOptions] -- options for the asset deployment dialog
         * @param {object} asset
         * @param {function} onSuccess
         * @param {function} onError
         * @returns {number} callId
         */
        this.saveAsset = function (asset, dialogOptions, onSuccess, onError) {
            this.validate(asset, 'object', 'You must provide an asset object to save.');

            var params = {
                asset : asset,
                dialogOptions : dialogOptions || {}
            };

            return this.method({
                name: 'saveAsset',
                params: params,
                successCallback: onSuccess,
                errorCallback: onError
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

        /***************
         * THEMES
         ***************/

        /**
         * Loads available themes for the current app or for specified appId.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} [appId]
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getThemes = function (appId, onSuccess, onError) {
            return this.method({
                name: 'getThemes',
                params: {
                    appId: appId
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Loads theme by id.
         *
         * Data is passed as the first param to the success callback.
         *
         * @param {function} [themeId]
         * @param {function} onSuccess
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.getTheme = function (themeId, onSuccess, onError) {
            return this.method({
                name: 'getTheme',
                params: {
                    id: themeId
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };


        /**
         * Creates a new theme under the current app instance app definition.
         * The new theme will be available only under the current user's account.
         *
         * @param {object} themeDefinition
         * @param {object} theme
         * @param {string} previewUrl
         * @param {Array} previewAsset
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.editTheme = function (themeDef, theme, previewUrl, previewAsset, layout, fonts, onSuccess, onError) {
            this.validate(themeDef, 'object', 'You must provide the theme definition (object).');

            return this.method({
                name: 'editTheme',
                params: {
                    themeDefinition: themeDef,
                    theme: theme,
                    previewUrl: previewUrl,
                    previewAsset: previewAsset,
                    layout: layout,
                    fonts: fonts
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Creates a new theme under the current app definition.
         * The new theme will be available to all users in the account.
         *
         * @param {object} theme
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.saveTheme = function (theme, onSuccess, onError) {
            this.validate(theme, 'object', 'You must provide the theme (object) to save.');
            this.validate(theme.Value, 'object', 'You must provide the theme.Value (object) to save.');

            return this.method({
                name: 'saveTheme',
                params: {
                     theme : theme
                },
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        /**
         * Deletes a theme from the current user's account for
         * the current app definition. Cannot remove default themes.
         *
         * @param {string} themeId
         * @param {function} [onSuccess]
         * @param {function} [onError]
         * @returns {number} callId
         */
        this.deleteTheme = function (themeId, onSuccess, onError) {
            this.validate(themeId, 'string', 'You must provide the ID (string) of the theme to remove.');
            return this.method({
                name: 'deleteTheme',
                params: {
                    themeId: themeId
                },
                successCallback: onSuccess,
                errorCallback: onError
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
