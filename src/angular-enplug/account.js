angular.module('enplug.sdk').factory('$enplugAccount', ['$log', '$enplugTransport', function ($log, $enplugTransport) {

    var transport = $enplugTransport;

    return {

        getAccount: function () {
            var methodCall = { name: 'app.getAccount' };
            return transport.callMethod(methodCall);
        },

        getAssets: function () {
            var methodCall = { name: 'app.getAssets' };
            return transport.callMethod(methodCall);
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

        updateAsset: function (id, value) {
            var methodCall = {
                name: 'app.updateAsset',
                params: [id, value]
            };
            return transport.callMethod(methodCall);
        },

        bulkCreateAssets: function (values) {
            var methodCall = {
                name: 'app.bulkCreateAssets',
                params: values
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
        }
    };
}]);
