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

        this.clearQueryString = function () {
            return this.method({
                name: 'clearQueryString'
            });
        };

        this.authenticate = function (authCode, redirectUri, onSuccess, onError) {
            this.validate(authCode, 'string', 'No authCode provided.');
            this.validate(redirectUri, 'string', 'No redirectUri provided.');
            return this.method({
                name: 'authenticate',
                params: {authCode: authCode, redirectUri: redirectUri},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.authFacebook = function (params, onSuccess, onError) {
            console.log('authFacebook', params);
            return this.method({
                name: 'authFacebook',
                params: params,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.authSlack = function(authToken, onSuccess, onError) {
            this.validate(authToken, 'No Slack auth token provided');
            return this.method({
                name: 'authSlack',
                params: { token: authToken },
                successCallback: onSuccess,
                errorCallback: onError
            });
        }

        this.addFacebookPage = function (feedId, pageId, accessToken, onSuccess, onError) {
            this.validate(feedId, 'string', 'No feedId provided');
            this.validate(pageId, 'string', 'No pageId provided');
            this.validate(accessToken, 'string', 'No accessToken provided');
            return this.method({
                name: 'addFacebookPage',
                params: {feedId: feedId, pageId: pageId, accessToken: accessToken},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.lookupTwitterId = function (username, onSuccess, onError) {
            this.validate(username, 'string', 'No username provided');
            return this.method({
                name: 'lookupTwitterId',
                params: username,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getSlackTeams = function(onSuccess, onError) {
            return this.method({
                name: 'getSlackTeams',
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.getSlackChannels = function(teamId, onSuccess, onError) {
            this.validate(teamId, 'No teamId provided');
            return this.method({
                name: 'getSlackChannels',
                params: teamId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        }

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

        this.deleteFeed = function (feedid, onSuccess, onError) {
            this.validate(feedid, 'string', 'No feedid provided.');
            return this.method({
                name: 'deleteFeed',
                params: feedid,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.openPreapprovalDialog = function (feed, iconUrl, options, onSuccess, onError) {
            this.validate(feed, 'object', 'No feed provided.');
            return this.method({
                name: 'openPreapprovalDialog',
                params: {feed: feed, iconUrl: iconUrl, options: options},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.loadAllItems = function (assetId, onSuccess, onError) {
            this.validate(assetId, 'string', 'No assetId provided.');
            return this.method({
                name: 'loadAllItems',
                params: assetId,
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.approveItem = function (itemId, assetId, onSuccess, onError) {
            this.validate(itemId, 'string', 'No itemId provided.');
            this.validate(assetId, 'string', 'No assetId provided.');
            return this.method({
                name: 'approveItem',
                params: {itemId: itemId, assetId: assetId},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.removeItem = function (itemId, assetId, onSuccess, onError) {
            this.validate(itemId, 'string', 'No itemId provided.');
            this.validate(assetId, 'string', 'No assetId provided.');
            return this.method({
                name: 'removeItem',
                params: {itemId: itemId, assetId: assetId},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.favoriteItem = function (itemId, assetId, network, onSuccess, onError) {
            this.validate(itemId, 'string', 'No itemId provided.');
            this.validate(assetId, 'string', 'No assetId provided.');
            this.validate(network, 'string', 'No network provided.');
            return this.method({
                name: 'favoriteItem',
                params: {itemId: itemId, assetId: assetId, network: network},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.unfavoriteItem = function (itemId, assetId, network, onSuccess, onError) {
            this.validate(itemId, 'string', 'No itemId provided.');
            this.validate(assetId, 'string', 'No assetId provided.');
            this.validate(network, 'string', 'No network provided.');
            return this.method({
                name: 'unfavoriteItem',
                params: {itemId: itemId, assetId: assetId, network: network},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.banItem = function (itemId, assetId, onSuccess, onError) {
            this.validate(itemId, 'string', 'No itemId provided.');
            this.validate(assetId, 'string', 'No assetId provided.');
            return this.method({
                name: 'banItem',
                params: {itemId: itemId, assetId: assetId},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.loadBlacklist = function (accountId, socialNetwork, onSuccess, onError) {
            this.validate(accountId, 'string', 'No accountId provided.');
            this.validate(socialNetwork, 'string', 'No socialNetwork provided.');
            return this.method({
                name: 'loadBlacklist',
                params: {accountId: accountId, socialNetwork: socialNetwork},
                successCallback: onSuccess,
                errorCallback: onError
            });
        };

        this.unbanUser = function (username, socialNetwork, accountId, onSuccess, onError) {
            this.validate(username, 'string', 'No username provided.');
            this.validate(socialNetwork, 'string', 'No socialNetwork provided.');
            this.validate(accountId, 'string', 'No accountId provided.');
            return this.method({
                name: 'unbanUser',
                params: {username: username, socialNetwork: socialNetwork, accountId: accountId},
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
