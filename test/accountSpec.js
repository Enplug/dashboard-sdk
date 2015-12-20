describe('AccountSender', function () {

    var account;

    beforeEach(function () {
        account = new enplug.classes.AccountSender();
    });

    afterEach(function () {
        account.transport.cleanup();
    });

    function callMethods(callback) {
        account.novalidate = true;
        for (var property in account) {
            if (account.hasOwnProperty(property) && typeof account[property] === 'function') {
                var callId = account[property]();
                callback(callId);
            }
        }
    }

    it('should prefix method calls with "app"', function () {
        spyOn(account.transport, 'send').and.callThrough();
        callMethods(function (callId) {
            var name = account.transport.pendingCalls[callId].name,
                count = (name.match(/app/g) || []).length;
            expect(count).toBe(1);
        });
    });

    // Validation
    it('should validate the account ID when loading instances', function () {
        var error = new Error(account.transport.tag + 'Missing account ID (string).');
        expect(function () {
            account.getInstances();
        }).toThrow(error);
    });

    it('should validate the name and value of new assets in createAsset', function () {
        expect(function () {
            account.createAsset();
        }).toThrow(new Error(account.transport.tag + 'You must provide a name (string) when creating an asset.'));

        expect(function () {
            account.createAsset('test');
        }).toThrow(new Error(account.transport.tag + 'You must provide a value (object) when creating an asset.'));
    });

    it('should validate the asset ID when creating default assets', function () {
        var error = new Error(account.transport.tag + 'Missing default asset ID (string).');
        expect(function () {
            account.createAssetFromDefault();
        }).toThrow(error);
    });

    it('should validate the asset ID and value when updating assets', function () {
        expect(function () {
            account.updateAsset();
        }).toThrow(new Error(account.transport.tag + 'You must provide the ID (string) of an asset to update.'));

        expect(function () {
            account.updateAsset('test');
        }).toThrow(new Error(account.transport.tag + 'You must provide the new value (object) of an asset to update.'));
    });

    it('should validate assets array when bulk creating assets', function () {
        var error = new Error(account.transport.tag + 'You must provide an array of assets to bulk create.');
        expect(function () {
            account.bulkCreateAssets();
        }).toThrow(error);
    });

    it('should validate assets array when bulk updating assets', function () {
        var error = new Error(account.transport.tag + 'You must provide an array of assets to bulk update.');
        expect(function () {
            account.bulkUpdateAssets();
        }).toThrow(error);
    });

    it('should validate asset IDs array when bulk removing assets', function () {
        var error = new Error(account.transport.tag + 'You must provide an array of asset IDs to bulk remove.');
        expect(function () {
            account.bulkRemoveAssets();
        }).toThrow(error);
    });

    it('should validate asset ID when removing an asset', function () {
        var error = new Error(account.transport.tag + 'You must provide the ID (string) of the asset to remove.');
        expect(function () {
            account.removeAsset();
        }).toThrow(error);
    });

    it('should validate theme object when creating a new theme', function () {
        var error = new Error(account.transport.tag + 'You must provide the new theme (object) to create.');
        expect(function () {
            account.createTheme();
        }).toThrow(error);
    });

    it('should validate theme ID when removing a theme', function () {
        var error = new Error(account.transport.tag + 'You must provide the ID (string) of the theme to remove.');
        expect(function () {
            account.removeTheme();
        }).toThrow(error);
    });

    it('should validate theme ID when activating a theme', function () {
        var error = new Error(account.transport.tag + 'You must provide the ID (string) of the theme to activate.');
        expect(function () {
            account.activateTheme();
        }).toThrow(error);
    });
});
