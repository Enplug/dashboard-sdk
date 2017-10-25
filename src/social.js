;(function (enplug, document) {
    'use strict';

    /**
     * Social feeds functionality
     *
     * @class
     * @extends Sender
     */
    function SocialSender() {

        // Call parent constructor with namespace
        enplug.classes.Sender.call(this, 'social');

        this.authenticate = function (authCode, redirectUrl, onSuccess, onError) {
            this.validate(authCode, 'string', 'No authCode provided.');
            this.validate(redirectUrl, 'string', 'No redirectUrl provided.');
            return this.method({
                name: 'authenticate',
                params: {authCode: authCode, redirectUrl: redirectUrl},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getFeeds = function (assetid, onSuccess, onError) {
            this.validate(assetid, 'string', 'No assetid provided.');
            return this.method({
                name: 'getFeeds',
                params: assetid,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.saveFeed = function (asset, onSuccess, onError) {
            this.validate(asset, 'object', 'No asset provided.');
            return this.method({
                name: 'saveFeed',
                params: asset,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };
    }

    // Inherit
    SocialSender.prototype = Object.create(enplug.classes.Sender.prototype);

    // Export
    enplug.classes.SocialSender = SocialSender;
    enplug.social = new SocialSender();
}(window.enplug, document));
