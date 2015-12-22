(function () {
    beforeEach(function () {

        // Returns an object mocking a response from the dashboard parent window
        window.mockResponse = function (options, raw) {
            var event = {
                type: 'message',
                data: {
                    success: true,
                },
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
        };
    });

    afterEach(function () {
        enplug.debug = false;
    });
}());
