describe('transport', function () {
    'use strict';

    var transport, window;

    // TODO: mock iframe? mock window.parent? mock API responses?

    beforeEach(function () {
        window = jasmine.createSpyObj('window', ['parent.postMessage', 'addEventListener']);
        transport = new enplug.Transport(window);
    });

    function mockCall(options) {
        var call = {
            name: 'test',
            params: true,
        };

        for (var property in options) {
            if (options.hasOwnProperty(property)) {
                call[property] = options[property];
            }
        }

        return call;
    }

    function mockResponse(options) {
        var event = {
            data: {
                success: true,
                namespace: 'Enplug'
            }
        };

        for (var property in options) {
            if (options.hasOwnProperty(property)) {
                event.data[property] = options[property];
            }
        }

        event.data = JSON.stringify(event.data);
        return event;
    }

    it('should increment call ID each time an API call is made', function () {
        for (var i = 1; i < 6; i++) {
            transport.send(mockCall());
            expect(transport.callId).toEqual(i);
        }
    });

    it('should assign a method call ID to method calls', function () {
        for (var i = 1; i < 6; i++) {
            var call = mockCall();
            transport.send(call);
            expect(call.callId).toEqual(i);
        }
    });

    it('should store the most recent call ID', function () {
        for (var i = 1; i < 6; i++) {
            var call = mockCall();
            transport.send(call);
            expect(call.callId).toEqual(transport.callId);
        }
    });

    it('should validate method call names', function () {
        var error = new Error(transport.tag + 'All transport method calls must have a name.');
        expect(function () {
            var call = mockCall({ name: null });
            transport.send(call);
        }).toThrow(error);
    });

    it ('should validate method call success callback type', function () {
        var error = new Error(transport.tag + 'Success callback must be a function.');
        expect(function () {
            var call = mockCall({ successCallback: 'test' });
            transport.send(call);
        }).toThrow(error);
    });

    it('should validate method call error callback type', function () {
        var error = new Error(transport.tag + 'Error callback must be a function.');
        expect(function () {
            var call = mockCall({ errorCallback: 'test' });
            transport.send(call);
        }).toThrow(error);
    });

    it('should add and remove non-transient API calls to and from the pending calls stack', function () {
        var call = mockCall();
        transport.send(call);
        expect(transport.pendingCalls[call.callId]).toBe(call);
        var response = mockResponse({ callId: call.callId });
        transport.receive(response);
        expect(transport.pendingCalls[call.callId]).toBeUndefined();
    });

    it('should not add transient method calls to the pending calls stack', function () {
        var call = mockCall({ transient: true });
        transport.send(call);
        expect(transport.pendingCalls[call.callId]).toBeUndefined();
    });

    it('should encode messages as JSON', function () {

    });

    it('should post messages', function () {

    });

    it('should ignore non-JSON messages', function () {

    });

    it('should ignore JSON messages without a call ID', function () {

    });

    it('should not ignore valid API responses', function () {

    });

    it('should not delete persistent method calls from the pending calls stack', function () {

    });

    it('should delete non-persistent method calls from the pending stack after receiving', function () {

    });

    it('should call the success callback for successful SDK calls', function () {

    });

    it('should call the error callback for failed SDK calls', function () {

    });

    it('should log to console when debug mode is enabled', function () {

    });
});
