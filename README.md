# Enplug JavaScript SDK

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Enplug/dashboard-sdk/blob/master/LICENSE)

The official Enplug JavaScript SDK for the dashboard/control interface of apps built for Enplug displays.

# THIS BRANCH IS CURRENTLY A WORK IN PROGRESS #
# LATEST STABLE IS v3.0.3 PLEASE INSTALL THAT INSTEAD #

## Table of Contents
- [Installing](#installing)
- [Usage](#usage-and-getting-started)
  - [Available APIs](#available-apis)
  - [Debug mode](#debug-mode)
  - [AngularJS plugin](#angularjs-plugin)
- [API documentation](#api-documentation)
  - [`enplug.account`](#enplugaccount)
  - [`enplug.dashboard`](#enplugdashboard)
- [Contributing](#contributing)

## Installing

- **CDN:** `<script src="http://cdn.enplug.net/libs/dashboard-sdk/3.0.3/sdk.min.js"></script>`
- **Bower:** `bower install enplug-dashboard-sdk --save-dev`
- **NPM:** `npm install @enplug/dashboard-sdk --save`

## Usage and Getting Started

When you build an app for Enplug displays, you also need to provide a web page that allows users to customize your app for their displays. This web page is loaded as an iFrame in the Enplug dashboard (dashboard.enplug.com). In order for your web page to communicate with and control the dashboard, you should use this SDK.

All SDK methods are asynchronous RPC calls. If you're loading data, the data will be provided via the `onSuccess` callback that every method provides. There is also an `onError` callback for you to handle errors.

### Available APIs
The SDK is split into two APIs:

**`enplug.account`:** Used for loading and modifying a user's account settings and app config.

**`enplug.dashboard`:** Provides convenient access to UI components:
  - Loading indicator (with loading, success and error states)
  - Confirm box with custom text
  - Confirm unsaved changes box
  - Change the page header title and buttons

Jump to the [API Documentation]() to read more.

### Debug mode

Set `enplug.debug = true;` for the SDK to log most actions to debug. You'll see messages like:
```
[Enplug SDK] Calling method: [MethodCall object]
```

### AngularJS plugin

The JavaScript SDK comes with a built-in AngularJS plugin. If you load the SDK in a project that has already loaded Angular, the plugin will automatically be initialized. The Angular plugin provides two services for working with the Enplug SDK, and returns promises instead of requiring the use of callbacks.

To use the plugin, first include the `enplug.sdk` module in your Angular app's dependencies:

```js
angular.module('myApp', ['enplug.sdk']);
```
Then, the `$enplugAccount` and `$enplugDashboard` are available in your app. All method calls will return promises you can chain to, and still accept callbacks if you prefer.
```js
angular.module('myApp').controller('MyController', function ($enplugAccount, $enplugDashboard) {
    'use strict';

    $enplugAccount.getAssets().then(function (assets) {
        $scope.assets = assets;
    });

    $enplugDashboard.openConfirm({ title: 'A title', text: 'A longer description' }).then(function () {
        // user confirmed
    }, function () {
        // user cancelled
    });
});
```

All methods available on [`enplug.account`](#enplugaccount) are also available on `$enplugAccount`, and all methods available on [`enplug.dashboard`](#enplugdashboard) are available on `$enplugDashboard`.

## API documentation

All methods take a success and an error callback as the final two parameters. For methods which load data, the success callback will be passed the data as the first and only parameter. The error callback is given the reason (`string`) an SDK method failed.

All methods return the API call ID, which can be used to find the API call in the pending calls stack during troubleshooting:
```js
enplug.account.transport.pendingCalls[callId]; // stores the API call and its details
```

**Example:**

```js
enplug.account.getAccount(function (data) {
    var accountId = data.accountId;
}, function (reason) {
    console.error('There was an error:', reason);
});
```

## enplug.account

### `.getAccount(onSuccess, onError)`
Loads all information for the current user.

**Callback receives:**
```js
{
  id: 'string', // Current display group ID
  type: 'string', // User account type
  appInstanceId: 'string', // ID of current app when turned on
  accountId: 'string' // Current user's account ID
}
```

### `.getDisplayGroups(onSuccess, onError)`
Loads information for the currently selected display group(s).

**Callback receives:**
```js
{
  language: 'string', // e.g. English, Russian, French
  orientation: 'string', // Landscape or Portrait
  timezone: 'string',
}
```

### `.getAssets(onSuccess, onError)`
Loads an array of assets for the current app instance.

**Callback receives:**
```js
[{
  Created: 'string', // WCF date
  Id: 'string', // Asset ID
  Name: 'string', // Asset Name
  Value: {} // Value object provided when created
}]
```

### `.createAsset(assetName, assetValue, onSuccess, onError)`
Creates an asset under the current app instance.

### `.updateAsset(id, value, onSuccess, onError)`
Updates an asset under the current app instance.

- **id:** string ID of the asset to be updated.
- **value:** object to update the asset's value to

### `.deleteAsset(id, onSuccess, onError)`
Deletes an asset under the current app instance.

## enplug.dashboard

All `enplug.dashboard` methods also accept success and error callbacks which acknowledge when a certain UI control has been triggered, but they aren't usually needed so they're left out of the documentation except in cases where they're used.

### `.setHeaderTitle(title)`
Sets the last part of the title bar breadcrumb. Set an empty title '' to clear the title.

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946451/c4ac0d06-a80f-11e5-970b-5b4d3558ba71.png)

### `.setHeaderButtons(buttons|button)`
Sets the primary action buttons for a page in the titlebar. Accepts either a single button object, or an array of buttons. Each button must have a button.action callback.
**button:**
```js
{
  text: 'button text',
  class: 'class-name',
  action: function () {}, // callback when clicked
  disabled: true, // boolean true/false
}
```

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946475/fc3c13a6-a80f-11e5-9edf-f25b182f79ca.png)

### `.pageLoading(boolean)`
Controls the loading state for the entire page. Every application starts off in loading state, and must set pageLoading(false) to notify the dashboard that it has successfully loaded.

Use `enplug.dashboard.isLoading()` to synchronously check current loading state.

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946414/5e70c248-a80f-11e5-99c2-b91dfd40c618.png)

### `.isLoading()`
Synchronously returns the current loading state.

**Note:** The loading state is updated asynchronously when this sender receives an acknowledgement of successful SDK call from the dashboard after using `.pageLoading(bool);`

### `.pageError()`
Puts the page into error state.

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946353/9bff1494-a80e-11e5-8649-0492bacb8deb.png)

### `.pageNotFound()`
Puts the page into 404 state.

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946387/1906bb72-a80f-11e5-88ec-d3b5db2c297f.png)

### `.loadingIndicator(message)`
Turns on the progress indicator, typically used during asynchronous actions.

Note that the progress indicator will continue until a call is made to the errorIndicator or successIndicator APIs.

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946284/cb4cd5a2-a80d-11e5-8920-540db9bd9ecd.png)

### `.successIndicator(message)`
Shows the success indicator. Should only be used after a call has been made to .loadingIndicator().

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946299/e9be68a2-a80d-11e5-95a5-15e85a21680c.png)

### `.errorIndicator(message)`
Shows the error indicator. Should only be used after a call has been made to .loadingIndicator().

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946307/015a823e-a80e-11e5-8ade-610da146e7b3.png)

### `.openConfirm(options, onSuccess, onError)`
Opens a confirm window with Yes/No buttons and configurable messages. If the user clicks the Confirm button, the success callback is called. Otherwise the error callback is called.

**Available options:**
```js
{
  title: 'string', // required
  text: 'string', // required
  confirmText: 'string', // optional, defaults to "Confirm"
  cancelText: 'string', // optional, defaults to "Cancel"
  confirmClass: 'string', // optional, defaults to primary button. Other option: 'btn-danger'
}
```

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946260/a551c312-a80d-11e5-82b1-cf475e72cb8b.png)

### `.confirmUnsavedChanges(onSuccess, onError)`
Opens a confirm window asking the user to confirm their unsaved changes. If the user clicks the confirm button, the success callback is called. Otherwise the error callback is called.

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946224/4fb86064-a80d-11e5-9aa7-8826e2362595.png)

### `.upload(options, onSuccess, onError)`
Opens an upload interface for the user to select a file to upload. The options parameter is currently unused. The success callback receives the newly uploaded and encoded file wrapped in an array:
```js
[{
  url: 'string', // publicly accessible URL for the encoded file
  filename: 'string', // filename of the uploaded file
  mimetype: 'string', // mimetype of the uploaded file
  size: 1000 // the size of the uploaded file in bytes, if available
}]
```

![Screenshot](https://cloud.githubusercontent.com/assets/1857007/11946331/4cd81b54-a80e-11e5-8703-9417f13d278b.png)

## Contributing

### Report Issues
Please send any issues to support@enplug.com.

### Build
Clone the repository, then install the dependencies:
```
npm install
bower install
grunt build
```
To compile files as they're changed, run:
```
grunt watch
```

### Unit Tests
After installing the dependencies, run:
```
grunt test
```

## License
This SDK is distributed under the MIT License, see [LICENSE](https://github.com/Enplug/dashboard-sdk/blob/master/LICENSE) for more information.
