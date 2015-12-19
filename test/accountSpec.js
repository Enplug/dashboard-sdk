describe('accountApis', function () {

    var account;

    beforeEach(function () {
        account = new enplug.classes.AccountSender();
    });

    function callMethods(callback) {
        account.novalidate = true;
        for (var property in account) {
            if (account.hasOwnProperty(property) && typeof account[property] === 'function') {
                account[property]();
                callback();
            }
        }
    }

    it('should support disabling validation for tests', function () {

    });

    it('should prefix method calls with "app"', function () {
        spyOn(enplug.transport, 'send');
        callMethods(function () {
            expect(enplug.transport.send).toHaveBeenCalled();
        });
    });

    it('should return incrementing call IDs for all method calls', function () {

    });

    // Validation
    it('should validate the account ID when loading instances', function () {

    });

    it('should validate the name and value of new assets in createAsset', function () {

    });

    it('should validate the asset ID when creating default assets', function () {

    });

    it('should validate the asset ID and value when updating assets', function () {

    });

    it('should validate assets array when bulk creating assets', function () {

    });

    it('should validate assets array when bulk updating assets', function () {

    });

    it('should validate asset IDs array when bulk removing assets', function () {

    });

    it('should validate asset ID when removing an asset', function () {

    });

    it('should validate theme object when creating a new theme', function () {

    });

    it('should validate theme ID when removing a theme', function () {

    });

    it('should validate theme ID when activating a theme', function () {

    });
});
