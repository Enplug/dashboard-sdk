describe('transport', function () {
    'use strict';

    var transport, window, namespace = 'Enplug';

    beforeEach(function () {
        enplug.debug = false;
        window = jasmine.createSpyObj('window', ['addEventListener']);
        window.parent = jasmine.createSpyObj('parent', ['postMessage']);
        transport = new enplug.classes.Transport(window, namespace);
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

    function mockResponse(options, raw) {
        var event = {
            data: {
                success: true,
                namespace: namespace
            }
        };

        for (var property in options) {
            if (options.hasOwnProperty(property)) {
                event.data[property] = options[property];
            }
        }

        if (!raw) {
            event.data = JSON.stringify(event.data);
        }

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

    it('should add non-transient API calls to the pending calls stack', function () {
        var call = mockCall();
        transport.send(call);
        expect(transport.pendingCalls[call.callId]).toBe(call);
    });

    it('should not add transient method calls to the pending calls stack', function () {
        var call = mockCall({ transient: true });
        transport.send(call);
        expect(transport.pendingCalls[call.callId]).toBeUndefined();
    });

    it('should post messages to the parent window', function () {
        var call = mockCall();
        transport.send(call);
        expect(window.parent.postMessage).toHaveBeenCalled();
    });

    it('should encode messages as JSON', function () {
        var call = mockCall();
        transport.send(call);
        expect(window.parent.postMessage).toHaveBeenCalledWith(JSON.stringify(call), '*');
    });

    it('should ignore non-JSON messages', function () {
        var response = mockResponse(null, true);
        expect(transport.receive(response)).toEqual(false);
    });

    it('should ignore JSON messages without a call ID', function () {
        var response = mockResponse({ callId: null });
        expect(transport.receive(response)).toEqual(false);
    });

    it('should not ignore valid API responses', function () {
        var call = mockCall();
        var callId = transport.send(call);
        var response = mockResponse({ callId: callId });
        expect(transport.receive(response)).toEqual(true);
    });

    it('should not delete persistent method calls from the pending calls stack', function () {
        var call = mockCall({ persistent: true });
        var callId = transport.send(call);
        var response = mockResponse({ callId: callId });
        transport.receive(response);
        expect(transport.pendingCalls[callId]).toEqual(call);
    });

    it('should delete non-persistent method calls from the pending stack after receiving', function () {
        var call = mockCall();
        transport.send(call);
        var response = mockResponse({ callId: call.callId });
        transport.receive(response);
        expect(transport.pendingCalls[call.callId]).toBeUndefined();
    });

    it('should call the success callback with response data for successful SDK calls', function () {
        var call = mockCall({ successCallback: jasmine.createSpy('callback') });
        transport.send(call);
        var response = mockResponse({ callId: call.callId, data: 'test' });
        transport.receive(response);
        expect(call.successCallback).toHaveBeenCalledWith(JSON.parse(response.data).data);
    });

    it('should call the error callback for failed SDK calls', function () {
        var call = mockCall({ errorCallback: jasmine.createSpy('callback') });
        transport.send(call);
        var response = mockResponse({ callId: call.callId, success: false, data: 'test' });
        transport.receive(response);
        expect(call.errorCallback).toHaveBeenCalledWith(JSON.parse(response.data).data);
    });

    it('should log to console when debug mode is enabled', function () {
        enplug.debug = true;
        spyOn(console, 'log');
        var call = mockCall();
        transport.send(call);
        expect(console.log).toHaveBeenCalledWith(transport.tag + 'Calling method:', call);
    });

    it('should correctly respond to namespaced events', function () {
        var namespace1 = 'test1',
            namespace2 = 'test2',
            transport1 = new enplug.classes.Transport(window, namespace1),
            transport2 = new enplug.classes.Transport(window, namespace2),
            call1 = mockCall(),
            call2 = mockCall();
        var callId1 = transport1.send(call1),
            callId2 = transport2.send(call2);
        var response1 = mockResponse({ callId: callId1, namespace: namespace1 }),
            response2 = mockResponse({ callId: callId2, namespace: namespace2 });

        // first transport
        expect(transport1.receive(response2)).toEqual(false);
        expect(transport1.pendingCalls[callId1]).toBe(call1);
        expect(transport1.receive(response1)).toEqual(true);
        expect(transport1.pendingCalls[callId1]).toBeUndefined();

        // second transport
        expect(transport2.receive(response1)).toEqual(false);
        expect(transport2.pendingCalls[callId2]).toBe(call2);
        expect(transport2.receive(response2)).toEqual(true);
        expect(transport2.pendingCalls[callId2]).toBeUndefined();
    });
});
