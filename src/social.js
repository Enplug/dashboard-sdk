;(function (enplug, document) {
  'use strict';

  /**
   * Social feeds functionality
   *
   *
   * @class
   * @extends Sender
   */
  function SocialSender () {

    // Call parent constructor with namespace
    enplug.classes.Sender.call(this, 'social');

    this.ttest = function (msg, onSuccess, onError) {
        this.validate(msg, 'string', 'No message provided.');
        return this.method({
            name: 'ttest',
            params: msg,
            transient: true,
            successCallback: onSuccess,
            errorCallback: onError
        });
    }
  }

  // Inherit
  SocialSender.prototype = Object.create(enplug.classes.Sender.prototype);

  // Export
  enplug.classes.SocialSender = SocialSender;
  enplug.social = new SocialSender();
}(window.enplug, document));
