describe('AccountSender', function () {

    var account;

    beforeEach(function () {
        account = new enplug.classes.AccountSender();
    });

    afterEach(function () {
        account.transport.cleanup();
    });

    it('should validate asset ID when removing an asset', function () {
        var error = new Error(account.transport.TAG + 'You must provide the ID (string) of the asset to delete.');
        expect(function () {
            account.deleteAsset();
        }).toThrow(error);
    });

    it('should validate theme object when creating a new theme', function () {
        var error = new Error(account.transport.TAG + 'You must provide the theme (object) to save.');
        expect(function () {
            account.saveTheme();
        }).toThrow(error);
    });

    it('should validate theme ID when removing a theme', function () {
        var error = new Error(account.transport.TAG + 'You must provide the ID (string) of the theme to remove.');
        expect(function () {
            account.deleteTheme();
        }).toThrow(error);
    });

    it('should validate theme ID when updating a theme', function () {
        var error = new Error(account.transport.TAG + 'You must provide the theme definition (object).');
        expect(function () {
            account.editTheme();
        }).toThrow(error);
    });
});
