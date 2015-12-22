describe('angularPlugin', function () {

    var account, dashboard;

    beforeEach(module('enplug.sdk'));

    beforeEach(inject(function ($enplugAccount, $enplugDashboard) {
        account = $enplugAccount;
        dashboard = $enplugDashboard;
    }));

    it('should inject the $enplugDashboard service', function () {
        expect(account).toBeDefined();
    });

    it('should inject the $enplugAccount service', function () {
        expect(dashboard).toBeDefined();
    });

    it('should synchronize the Angular services with the native objects', function () {
        expect(enplug.account).toBe(account);
        expect(enplug.dashboard).toBe(dashboard);
    });

    it('should return a promise from method calls', function () {
        var promise1 = account.method({ name: 'test' }),
            promise2 = dashboard.method({ name: 'test' });
        expect(typeof promise1.then).toEqual('function');
        expect(typeof promise2.then).toEqual('function');
    });

    it('should resolve promises with result on success', function () {
        var promise = account.method({ name: 'test' }),
            callback = jasmine.createSpy('callback'),
            data = 'test',
            callId = account.transport.pendingCalls[1].callId, // assume call ID for a single call,
            response = mockResponse({ callId: callId, data: data, namespace: account.transport.namespace });
        promise.then(callback);
        account.transport.handleEvent(response);
        expect(callback).toHaveBeenCalledWith(data);
    });

    it('should reject promises with reason on error', function () {
        var promise = account.method({ name: 'test' }),
            callback = jasmine.createSpy('callback'),
            data = 'test',
            callId = account.transport.pendingCalls[1].callId, // assume call ID for a single call,
            response = mockResponse({ success: false, callId: callId, data: data, namespace: account.transport.namespace });
        promise.then(null, callback);
        account.transport.handleEvent(response);
        expect(callback).toHaveBeenCalledWith(data);
    });

    it('should still call success callbacks', function () {
        var callback = jasmine.createSpy('callback'),
            data = 'test';
        account.method({ name: 'test', successCallback: callback });
        var callId = account.transport.pendingCalls[1].callId, // assume call ID for a single call,
            response = mockResponse({ callId: callId, data: data, namespace: account.transport.namespace });
        account.transport.handleEvent(response);
        expect(callback).toHaveBeenCalledWith(data);
    });

    it('should still call error callbacks', function () {
        var callback = jasmine.createSpy('callback'),
            data = 'test';
        account.method({ name: 'test', errorCallback: callback });
        var callId = account.transport.pendingCalls[1].callId, // assume call ID for a single call,
            response = mockResponse({ success: false, callId: callId, data: data, namespace: account.transport.namespace });
        account.transport.handleEvent(response);
        expect(callback).toHaveBeenCalledWith(data);
    });
});
