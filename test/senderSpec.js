describe('apiSender', function () {
    'use strict';

    var sender;

    beforeEach(function () {
        sender = new enplug.classes.Sender('test');
    });

    it('should require a prefix', function () {
        var error = new Error('Senders must specify a method prefix.');
        expect(function () {
            sender = new enplug.classes.Sender();
        }).toThrow(error);
    });

    it('should validate built in JS types', function () {
        expect(function () {
            sender.validate('test', 'number');
        }).toThrow();

        expect(function () {
            sender.validate(1, 'string');
        }).toThrow();

        expect(function () {
            sender.validate(true, 'object');
        }).toThrow();
    });

    it('should not allow null', function () {
        expect(function () {
            sender.validate(null, 'object');
        }).toThrow();
    });

    it('should validate array data', function () {
        expect(function () {
            sender.validate({}, 'array');
        }).toThrow();
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
        var error = new Error('Transport options must be an object.');
        expect(function () {
            sender.method();
        }).toThrow(error);
    });

    it('should allow empty strings', function () {
        expect(function () {
            sender.validate('', 'string');
        }).not.toThrow();
    });

    it('should allow false', function () {
        expect(function () {
            sender.validate(false, 'boolean');
        }).not.toThrow();
    });

    it('should implement a cleanup function for removing event listeners', function () {
        expect(typeof sender.cleanup).toBe('function');
    });
});
