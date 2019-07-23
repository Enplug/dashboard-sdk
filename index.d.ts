/* - DASHBOARD types - */

export interface Dashboard {
  /**
   * Removes this sender's {@link Transport} event listeners to prevent memory leaks.
   */
  cleanup(): void;

  /**
   * Notifies the parent dashboard of a click in the child iFrame. Used to close
   * dropdown windows etc which were opened in parent window and are unable to
   * respond to click events in child iFrame.
   *
   * Event handler is automatically bound when a DashboardSender is created.
   */
  click(): CallId;

  /**
   * Opens a confirm window asking the user to confirm their unsaved changes.
   *
   * If the user clicks the confirm button, the success callback is called.
   * Otherwise the error callback is called.
   */
  confirmUnsavedChanges(onSuccess?: Function, onError?: Function): CallId;

  /**
   * Shows the error indicator.
   *
   * Should only be used after a call has been made to .loadingIndicator().
   */
  errorIndicator(message: string, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Synchronously returns the current loading state.
   *
   * Updated asynchronously when this sender receives an acknowledgement
   * of successful SDK call from the dashboard.
   */
  isLoading(): boolean;

  /**
   * Turns on the progress indicator, typically used during asynchronous actions.
   *
   * Note that the progress indicator will continue until a call is made to the
   * errorIndicator or successIndicator APIs.
   */
  loadingIndicator(message: string, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Navigate to url.
   */
  navigate(url: string, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Navigate back from widget.
   */
  navigateBack(assetId: string, onSuccess?: Function, onError?: Function): CallId;

  novalidate: boolean;

  /**
   * Opens a confirm window with Yes/No buttons and configurable messages.
   * If the user clicks the Confirm button, the success callback is called.
   * Otherwise the error callback is called.
   */
  openConfirm(options: OpenConfirmOptions, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Puts the page into error state.
   */
  pageError(onSuccess?: Function, onError?: Function): CallId;

  /**
   * Controls the loading state for the entire page. Every application starts off in
   * loading state, and must set pageLoading(false) to notify the dashboard that it
   * has successfully loaded.
   *
   * Use .isLoading() to synchronously check current loading state.
   */
  pageLoading(bool: boolean, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Puts the page into 404 state.
   */
  pageNotFound(onSuccess?: Function, onError?: Function): CallId;

  prefix: 'dashboard';

  /**
   * Opens app preview modal.
   */
  preview<T1, T2, T3>(url: string, asset: Asset<T1>, theme: ThemeAsset<T2>, layout?: Layout, feedData?: FeedData<T3>, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Sets the current callback for the title bar breadcrumb display selector dropdown.
   * Attaching a callback enables the dropdown, it is disabled by default.
   * The title is reset when the dashboard changes routes.
   *
   * the callback is fired when a display is selected, the callback will get the ID
   * value when a single display is fired, or null when the 'All' selection is selected
   */
  setDisplaySelectorCallback(callback: Function, onError?: Function): CallId;

  /**
   * Hides or shows the display dropdown selector in the page title breadcrumb bar.
   * Send true to show the selector, false to hide it.
   */
  setDisplaySelectorVisibility(show: boolean, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Sets the primary action buttons for a page in the titlebar.
   *
   * Accepts either a single button object, or an array of buttons.
   * Each button must have a button.action callback.
   */
  setHeaderButtons(button: Button, onSuccess?: Function, onError?: Function): CallId;
  setHeaderButtons(buttons: Button[], onSuccess?: Function, onError?: Function): CallId;

  /**
   * Sets the last part of the title bar breadcrumb.
   * Set an empty title '' to clear the title.
   * Re-setting this value wipes out the old one.
   *
   * The home/default page for an app should have no title set.
   */
  setHeaderTitle(title: string, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Shows the success indicator.
   *
   * Should only be used after a call has been made to .loadingIndicator().
   */
  successIndicator(message: string, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Switches to account view aka "All" selection of instance selector or DisplayGroup view
   */
  switchToView(displayGroupId: any, displayGroupName: any, onSuccess?: Function, onError?: Function): CallId;

  transport: any

  /**
   * Uses Filepicker upload interface and Enplug encoding service, returns uploaded object
   */
  upload(options: FilepickerOptions, onSuccess?: (files: FilepickerUploadedFile[]) => void, onError?: Function): CallId;

  /**
   * Creates new assets and begins encoding process
   */
  processAssetResource(accountId: string, appId: string, assets: Asset<any>[], onSuccess: Function, onError: Function): CallId;

  /**
   * Returns current encoding status of an asset
   */
  encodeStatus(url: string, onSuccess: Function, onError: Function): CallId; 

  /**
   * opens content interval settings dialog for ad-scheduler app
   */
  openContentIntervalSettingsDialog(appName: string, level: string, levelId: string, onSuccess: Function, onError: Function): CallId; 

  /**
   * Lets dashboard know that the state of user changes in the app changed
   */
  setAppHasUnsavedChanges(hasUnsavedChanges: boolean, onError?: Function): CallId;
}

export type CallId = number;

export interface Asset<T> {
  Created?: string;      // WCF date
  Id: string | null;     // Asset ID
  Schedule?: Schedule;
  Value: T;              // Value object provided when created
  VenueIds: string[];    // Array of Ids of Display Groups this asset is currently deployed to
  ThemeId?: string;      // Optional Theme Id if set
}

export interface Schedule {
  ActivationDate?: string;    // "2019-03-27T00:00:00"
  ActiveDays: string[];       // Limit days
  Created: string;            // WCF date
  DeleteWhenExpired: boolean;
  ExpirationCount: number;
  ExpirationDate: string;     // "2019-03-27T00:00:00"
  Id: string;                 // Schedule ID
  IsDeleted: boolean;
  IsPriority: boolean;
  LastSaved: string;          // WCF date
  PlayTimes: TimeRange[];
  Recurrence: number;
}

export interface TimeRange {
  StartTime: string;  // "09:00:00"
  EndTime: string;    // "22:59:00"
}

export interface ThemeAsset<T> {
  Id: string | null;
  IsDefault: boolean;
  Name: string;
  Value: T;
}

export interface ThemeBackground {
  backgroundAlpha: number;
  backgroundAlpha2: number;
  backgroundColor: string;
  backgroundColor2: string;
  backgroundImage: string;
  backgroundImageLabel: string;
  backgroundTypes: [boolean, boolean];
  gradient: 'Solid' | 'Vertical Gradient' | 'Horizontal Gradient' | 'Radial Gradient';
}

export interface Theme {
  name: string;
  sections: ThemeSection[];
}

export interface ThemeSection {
  label: string;
  name: string;
  properties: ThemeSectionProperties[]
}

export interface ThemeSectionProperties {
  label: string;
  type: ThemePropertyType;
  name: string;
}

export type ThemePropertyType = 'color' | 'font' | 'backgroundSelector' | 'backgroundColor';

export type Orientation = 'landscape' | 'portrait';

export type WidgetType = 'main' | 'banner' | 'ticker';

export interface Layout {
  orientation: Orientation;
  widgetType?: WidgetType;
  zones?: number;
  position?: number;
  flip?: boolean;
}

export interface FeedData<T> {
  socialItems?: any[];
  socialFeeds?: any[];
  trigger: T;
}

export interface Button {
  text: string;
  class: string;
  action: Function;
  disabled?: boolean;
  icon?: string;
}

export interface OpenConfirmOptions {
  title: string;
  text: string;
  cancelText?: string;
  confirmText?: string;
  confirmClass?: string;
}

export interface FilepickerOptions {
  accept?: string | string[];
  maxFiles?: number;
  multiple?: boolean;
  folders?: boolean;
  openTo?: string;
  webcamDim?: [width, height];
  customSourceContainer?: string;
  customSourcePath?: string;
  debug?: boolean;
  policy?: any,
  signature?: any;
  backgroundUpload?: boolean;
  hide?: boolean;
  customCss?: string;
  customText?: string;
  imageQuality?: number;
  imageDim?: [width, height];
  imageMax?: [width, height];
  imageMin?: [width, height];
  conversions?: FilepickerConversion[];
  cropRatio?: number;
  cropDim?: [width, height];
  cropMax?: [width, height];
  cropMin?: [width, height];
  cropForce?: boolean;
  storeTo?: FilepickerStoreToOptions;
}

export interface FilepickerUploadedFile {
  url: string;      // publicly accessible URL for the encoded file
  filename: string; // filename of the uploaded file
  mimetype: string; // mimetype of the uploaded file
  size?: number     // the size of the uploaded file in bytes, if available
}

export interface FilepickerStoreToOptions {
  location?: 's3';
  path?: string;
  container?: string;
  region?: string;
  access?: 'public' | 'private';
}

export type width = number;
export type height = number;

export type FilepickerConversion = 'crop' | 'rotate' | 'filter';


/* - ACCOUNT types - */

export interface Account {
  /**
   * Loads all information for the current user. App instance ID,
   * account type, token, account ID, venue ID, and environment.
   *
   * Data is passed as the first param to the success callback.
   */
   getAccount(onSuccess: Function, onError?: Function): CallId;

  /**
   * Loads all information for the current user.
   */
   getUser(onSuccess: (user: User) => void, onError?: Function): CallId;

  /**
   * Loads information for the display groups available in current view.
   * In the Display Group view it will return currently selected Display Group.
   * In Account view it will return all DisplayGroups in the account.
   * Language, orientation and time zone.
   *
   * Data is passed as the first param to the success callback.
   */
   getDisplayGroups(onSuccess: (groups: DisplayGroup[]) => void, onError?: Function): CallId;

  /**
   * Loads information for the display groups available in current view.
   * Language, orientation and time zone.
   *
   * Data is passed as the first param to the success callback.
   */
   getSelectedDisplayId(onSuccess: (groupId: string | null) => void, onError?: Function): CallId;

  /***************
   * ASSETS
   ***************/

  /**
   * Loads an array of assets for the current app instance.
   *
   * Data is passed as the first param to the success callback.
   */
   getAssets<T>(onSuccess?: (assets: Asset<T>[]) => void, onError?: Function): CallId;

  /**
   * Loads an array of assets by Ids
   *
   * Data is passed as the first param to the success callback.
   */
  getAssetsByIds<T>(assetsIds: string[], onSuccess?: (assets: Asset<T>[]) => void, onError?: Function): CallId;

  /**
   * Loads an array of assets for a specifig app instance.
   *
   * Data is passed as the first param to the success callback.
   */
   getAssetsForApp<T>(appId: string, onSuccess?: (assets: Asset<T>[]) => void, onError?: Function): CallId;

  /**
   * Creates an asset under the current app instance.
   */
   bulkCreateAssets<T>(assets: Asset<T>[], dialogOptions?: {}, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Creates an asset under the current app instance.
   */
   bulkDeployAssets<T>(assets: Asset<T>[], dialogOptions?: {}, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Saves an asset without showing the deployment dialog.
   */
   saveAsset<T>(asset: Asset<T>, dialogOptions?: DeployDialogOptions, onSuccess?: Function, onError?: Function): CallId;

  /**
   * This is for saving an order of assets if needed for the current app. An array of asset Ids
   * is all that is needed, but the implementation also accepts an array of asset objects with "Id" string properties.
   */
   updateAssetOrder(assets: string[] | Asset<any>[], onSuccess?: Function, onError?: Function): CallId;

  /**
   * Deletes an asset for the current app instance.
   */
   deleteAsset(id: string | string[], onSuccess?: Function, onError?: Function): CallId;

  /**
   * Loads an array of default assets for the current instance's app definition.
   *
   * Data is passed as the first param to the success callback.
   */
   getDefaultAssets(onSuccess: Function, onError?: Function): CallId;


  /***************
   * THEMES
   ***************/

  /**
   * Loads available themes for the current app or for specified appId.
   *
   * Data is passed as the first param to the success callback.
   */
   getThemes(appId: string, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Loads theme by id.
   *
   * Data is passed as the first param to the success callback.
   */
   getTheme(themeId: string, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Creates a new theme under the current app instance app definition.
   * The new theme will be available only under the current user's account.
   */
   editTheme<T1, T2>(themeDef: {}, theme: Theme, previewUrl: string, previewAsset?: Asset<T1>[], layout?: Layout, fonts?: any, feedData?: FeedData<T2>, onSuccess?: Function, onError?: Function): Promise<any>;

  /**
   * Creates a new theme under the current app definition.
   * The new theme will be available to all users in the account.
   */
   saveTheme(theme: Theme, onSuccess?: Function, onError?: Function): CallId;

  /**
   * Deletes a theme from the current user's account for
   * the current app definition. Cannot remove default themes.
   */
  deleteTheme(themeId: string, onSuccess?: Function, onError?: Function): CallId;
  /**
   * Returns flag status on account
   */
  hasFeatureFlag(flagName: string, onSuccess?: Function, onError?: Function): CallId;
}

export interface User {
  id: string;             // User id in the system
  accountId: string       // Current user's account ID
  type: string;           // User access type
  data: {
      email: string;
      firstName: string;
      accountName: string;
      locale: string;
  },
  has: {
      rootAccess: boolean;
      limitedAccess: boolean;
  }
}

export interface DisplayGroup {
  language: string;     // e.g. English, Russian, French
  orientation: string;  // Landscape or Portrait
  timezone: string;
}

export interface DeployDialogOptions {
  showSchedule?: boolean;
  scheduleOptions?: {                // option to show duration slider when showDuration is set to true
    showDuration: boolean;           // allow user to choose the duration of each asset shown on player
    showLimitDays?: boolean;             
    showLimitTime?: boolean;
    showScheduleForLater?: boolean;
    showRepeat?: boolean;            // allow user to choose the schedule repeat options
    showPriorityPlay?: boolean;      // allow user to edit Priotiy Play flag
    setDefaultDurationForNewImages?: boolean; // Graphics app only this one
  };
  singleton?: boolean;
  isNew?: boolean;
  initialTab?: string;               // by default, other option is 'schedule'
  successMessage?: string;           // Message to show when the save is successful
  loadingMessage?: string;           // Message to show while the save call is in progress
  showDeployDialog?: boolean;        // To force showing the DeployDialog when updating existing asset,
                                     // it will be always shown when saving a new asset irrespective of this option
  requiredAssetProps?: string[];      // asset.Value props to validate
  showTagsEditor?: boolean;          // allow user to edit assets' tags

  assetsToNavigate?: Asset<any>[] // Graphics app only this one - list of assets to traverse with < > buttons
  canNavigate?: boolean; // Graphics app only this one
  showDetails?: boolean; // Graphics app only this one
  showReporting?: boolean; // Graphics app only this one
}


/* - SOCIAL types - */
export interface FacebookAuthParams {
    FeedId: string;
    AdminAccessToken: string;
    PageId: string;
}

export interface SocialItemMedia {
    Source: string;
    Type: string;
}

export interface SocialItemUser {
    Avatar: string;
    Link: string;
    Name: string;
}

export interface SocialItem {
    Created: Date;
    FlaggedWords: any[];
    Id: string;
    IsFavorited: boolean;
    Link: string;
    Media: SocialItemMedia;
    SocialItemId: string;
    SocialNetwork: string;
    Text: string;
    User: User;
}

export interface SocialItemsResponse {
    __type: string;
    LiveItems: SocialItem[];
    PendingItems: SocialItem[];
    SocialNetworks: string[];
}

export interface PreapprovalDialogOptions {
    showVideoEnabled?: boolean;
    showImagesEnabled?: boolean;
    showConnectedUserNeedsApproval?: boolean;
}

export interface Social {
  clearQueryString: () => CallId,
  authInstagram: (accessToken: string, onSuccess?: Function, onError?: Function) => CallId;
  authSlack: (authCode: string, redirectUrl: string, onSuccess?: Function, onError?: Function) => CallId;
  getInstagramAccounts: (facebookUserId: string, onSuccess: Function, onError: Function) => CallId;
  lookupTwitterId: (username: string, onSuccess?: Function, onError?: Function) => CallId;
  getSlackTeams: (onSuccess?: Function, onError?: Function) => CallId;
  getSlackChannels: (teamId: string, onSuccess?: Function, onError?: Function) => CallId;
  addFacebookPage: (feedId: string, pageId: string, accessToken: string, onSuccess?: Function, onError?: Function) => CallId;
  getFeeds: (assetid: string, onSuccess?: Function, onError?: Function) => CallId;
  saveFeed: (feed: any, onSuccess?: Function, onError?: Function) => CallId;
  deleteFeed: (feedId: string, onSuccess?: Function, onError?: Function) => CallId;
  openPreapprovalDialog: (feed: Object, iconUrl: string, options?: PreapprovalDialogOptions, onSuccess?: Function, onError?: Function) => CallId;

  loadAllItems: (assetId: string, onSuccess?: (response: SocialItemsResponse) => any, onError?: Function) => CallId;
  approveItem: (itemId: string, assetId: string, onSuccess?: Function, onError?: Function) => CallId;
  removeItem: (itemId: string, assetId: string, onSuccess?: Function, onError?: Function) => CallId;
  favoriteItem: (itemId: string, assetId: string, network: string, onSuccess?: Function, onError?: Function) => CallId;
  unfavoriteItem: (itemId: string, assetId: string, network: string, onSuccess?: Function, onError?: Function) => CallId;
  banItem: (itemId: string, assetId: string, onSuccess?: Function, onError?: Function) => CallId;

  loadBlacklist: (accountId: string, socialNetwork: string, onSuccess?: Function, onError?: Function) => CallId;
  unbanUser: (username: string, socialNetwork: string, accountId: string, onSuccess?: Function, onError?: Function) => CallId;
}

/***************
 * ENPLUG OBJECT
 ***************/

declare const enplug: {
  debug: boolean;
  account: Account;
  classes: {
    AccountSender: () => any,
    DashboardSender: () => any,
    SenderSender: () => any,
    TransportSender: () => any,
  },
  dashboard: Dashboard;
  social: Social;
  noop: () => void;
};

export default enplug;

declare global {
  interface Window {
    enplug;
  }
}
