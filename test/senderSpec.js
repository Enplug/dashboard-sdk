describe('apiSender', function () {
    'use strict';

    var sender;

    beforeEach(function () {
        sender = new enplug.classes.Sender('test');
    });

    it('should require a prefix', function () {

    });

    it('should validate built in JS types', function () {

    });

    it('should validate array data', function () {

    });

    it('should support disabling validation for tests', function () {
        sender.novalidate = true;
        expect(function () {
            sender.validate(null, 'string');
        }).not.toThrow();
    });

    it('should return incrementing call IDs for all method calls, starting with 1', function () {
        sender.novalidate = true;
        for (var i = 1; i < 6; i++) {
            var callId = sender.method({ name: 'test' });
            expect(callId).toEqual(i);
        }
    });

    it('should validate method call options before sending', function () {

    });

    it('should allow empty strings', function () {

    });

    it('should allow false', function () {

    });

    it('should implement a cleanup function for removing event listeners', function () {

    });
});
