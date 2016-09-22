# Enplug Dashboard SDK

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Enplug/dashboard-sdk/blob/master/LICENSE)

The official Enplug JavaScript SDK for the dashboard/control interface of apps built for Enplug displays.

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

### `.getUser(onSuccess, onError)`
Loads all information for the current user.

**Callback receives:**
```js
{
  id: 'string', // User id in the system
  accountId: 'string' // Current user's account ID
  type: 'string', // User access type
  data: {
      email: 'string', // User email
      firstName: 'string', // User name
      accountName: 'string', // User account name
  },
  has: {
      rootAccess: true, // boolean true/false
      limitedAccess: true, // boolean true/false
  }
}
```

### `.getDisplays(onSuccess, onError)`
Loads information for the currently selected display group(s). In the account context it will return all Display Groups in the account, in the Display Group context will return only this groups information.

**Callback receives:**
```js
{
  language: 'string', // e.g. English, Russian, French
  orientation: 'string', // Landscape or Portrait
  timezone: 'string',
}
```

### `.getSelectedDisplayId(onSuccess, onError)`
Returns the currently selected display group Id or null if in the Account view.


### `.getAssets(onSuccess, onError)`
Loads an array of assets for the current app instance.

**Callback receives:**
```js
[{
  Created: 'string', // WCF date
  Id: 'string', // Asset ID
  Value: {}, // Value object provided when created
  VenueIds: [], // Array of Ids of Display Groups this asset is currently deployed to
  ThemeId: 'string' // Optional Theme Id if set
}]
```

### `.saveAsset(asset, dialogOptions, onSuccess, onError)`
Creates or updates an asset. If asset.Id is null it will create a new asset, otherwise it will update the existing one.

- **asset:** object to update the asset's value to
- **dialogOptions:** DeployDialog options, object specifying one or more options:

```js
{
  showSchedule: false, // by default
  initialTab: 'displays', // by default, other option is 'schedule'
  successMessage: 'Saved config', // Message to show when the save is successful
  loadingMessage: 'Saving...', // Message to show while the save call is in progress
  showDeployDialog: true // To force showing the DeployDialog when updating existing asset,
                         // it will be always shown when saving a new asset irrespective of this option
}
```

### `.deleteAsset(id, onSuccess, onError)`
Deletes one or many assets under the current app instance.

- **id:** id of the asset to delete or array of ids

### `.getThemes(onSuccess, onError)`
Loads an array of assets for the current app instance.

**Callback receives:**
```js
[{
  Created: 'string', // WCF date
  Id: 'string', // Theme ID
  Value: {}, // Theme definition
}]
```

### `.saveTheme(theme, onSuccess, onError)`
Creates or updates a theme. If theme.Id is null it will create a new theme, otherwise it will update the existing one.
To use a theme associate it with an existing Asset by calling saveAsset and setting ThemeId.

- **theme:** object to update the theme's value to

### `.deleteTheme(id, onSuccess, onError)`
Deletes an existing theme.

- **id:** id of the theme to delete

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
