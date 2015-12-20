describe('DashboardSender', function () {

    var dashboard;

    beforeEach(function () {
        dashboard = new enplug.classes.DashboardSender();
    });

    afterEach(function () {
        dashboard.cleanup();
    });

    function callMethods(callback) {
        dashboard.novalidate = true;
        for (var property in dashboard) {
            if (dashboard.hasOwnProperty(property) && typeof dashboard[property] === 'function') {
                var callId = dashboard[property]();
                callback(callId);
            }
        }
    }

    it('should prefix method calls with "dashboard"', function () {
        spyOn(dashboard.transport, 'send').and.callThrough();
        callMethods(function (callId) {
            var call = dashboard.transport.pendingCalls[callId];
            if (call) {
                var name = call.name,
                    count = (name.match(/dashboard/g) || []).length;
                expect(count).toBe(1);
            }
        });
    });

    it('should register a handler for document clicks', function () {
        spyOn(dashboard, 'click');
        var event = document.createEvent('HTMLEvents');
        event.initEvent('click', true, true);
        window.document.dispatchEvent(event);
        expect(dashboard.click).toHaveBeenCalled();
    });

    it('should deregister a handler for document clicks', function () {
        spyOn(dashboard, 'click');
        dashboard.cleanup();
        var event = document.createEvent('HTMLEvents');
        event.initEvent('click', true, true);
        window.document.dispatchEvent(event);
        expect(dashboard.click).not.toHaveBeenCalled();
    });

    it('should track page loading status', function () {
        var callId;
        expect(dashboard.isLoading()).toBe(true);
        callId = dashboard.pageLoading(false);
        dashboard.transport.handleEvent(mockResponse({ callId: callId, namespace: dashboard.transport.namespace }));
        expect(dashboard.isLoading()).toBe(false);
        callId = dashboard.pageLoading(true);
        dashboard.transport.handleEvent(mockResponse({ callId: callId, namespace: dashboard.transport.namespace }));
        expect(dashboard.isLoading()).toBe(true);
    });

    it('should respond to callbacks with loading status when setting page loading status', function () {
        var callback = jasmine.createSpy('callback'),
            callId = dashboard.pageLoading(false, callback);
        dashboard.transport.handleEvent(mockResponse({ callId: callId, namespace: dashboard.transport.namespace }));
        expect(callback).toHaveBeenCalledWith(false);
    });

    it('should call the correct button when clicked', function () {
        var button = jasmine.createSpyObj('button', ['action']);
        var callId = dashboard.setHeaderButtons(button);
        dashboard.transport.handleEvent(mockResponse({ callId: callId, namespace: dashboard.transport.namespace, data: { id: button.id } }));
        expect(button.action).toHaveBeenCalled();
    });

    it('should respond to multiple button clicks', function () {
        var button = jasmine.createSpyObj('button', ['action']);
        var callId = dashboard.setHeaderButtons(button);
        var response = mockResponse({ callId: callId, namespace: dashboard.transport.namespace, data: { id: button.id } });
        dashboard.transport.handleEvent(response);
        dashboard.transport.handleEvent(response);
        dashboard.transport.handleEvent(response);
        expect(button.action.calls.count()).toEqual(3);
    });

    it('should respond to callbacks when setting buttons', function () {
        var button = jasmine.createSpyObj('button', ['action']),
            callback = jasmine.createSpy('callback'),
            callId = dashboard.setHeaderButtons(button, callback),
            data = { id: button.id };
        dashboard.transport.handleEvent(mockResponse({ callId: callId, namespace: dashboard.transport.namespace, data: data }));
        expect(button.action).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(data);
    });

    // Validation

    it('should validate the header title', function () {
        var error = new Error(dashboard.transport.tag + 'Header title must be a string.');
        expect(function () {
            dashboard.setHeaderTitle();
        }).toThrow(error);
    });

    it('should validate page loading boolean', function () {
        var error = new Error(dashboard.transport.tag + 'Page loading status must be a boolean.');
        expect(function () {
            dashboard.pageLoading();
        }).toThrow(error);
    });

    it('should validate loading indicator messages', function () {
        var error = new Error(dashboard.transport.tag + 'Loading indicator requires a loading message (string)');
        expect(function () {
            dashboard.loadingIndicator();
        }).toThrow(error);
    });

    it('should validate success indicator messages', function () {
        var error = new Error(dashboard.transport.tag + 'Success indicator requires a success message (string)');
        expect(function () {
            dashboard.successIndicator();
        }).toThrow(error);
    });

    it('should validate error indicator messages', function () {
        var error = new Error(dashboard.transport.tag + 'Error indicator requires an error message (string)');
        expect(function () {
            dashboard.errorIndicator();
        }).toThrow(error);
    });

    it('should validate confirm box options', function () {
        var error = new Error(dashboard.transport.tag + 'Confirm box requires options to be set (object).');
        expect(function () {
            dashboard.openConfirm();
        }).toThrow(error);
    });

    it('should validate confirm box title', function () {
        var error = new Error(dashboard.transport.tag + 'Confirm box requires options.title to be set (string).');
        expect(function () {
            dashboard.openConfirm({});
        }).toThrow(error);
    });

    it('should validate confirm box text', function () {
        var error = new Error(dashboard.transport.tag + 'Confirm box requires options.text to be set (string).');
        expect(function () {
            dashboard.openConfirm({ title: 'test' });
        }).toThrow(error);
    });

    it('should validate the buttons object', function () {
        var error = new Error(dashboard.transport.tag + 'Header buttons must be an object (single) or array (multiple).');
        expect(function () {
            dashboard.setHeaderButtons();
        }).toThrow(error);
    });

    it('should validate individual buttons', function () {
        var error = new Error(dashboard.transport.tag + 'Header buttons must be objects.');
        expect(function () {
            dashboard.setHeaderButtons(['test']);
        }).toThrow(error);
    });

    it('should validate button action functions', function () {
        var error = new Error(dashboard.transport.tag + 'Header buttons must have an action (function).');
        expect(function () {
            dashboard.setHeaderButtons({});
        }).toThrow(error);
    });
});
