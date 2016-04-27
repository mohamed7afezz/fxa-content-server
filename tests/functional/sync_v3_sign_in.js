/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v3&service=sync';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  registerSuite({
    name: 'Firefox Desktop Sync v3 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote
        .then(clearBrowserState(this));
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(this, PAGE_URL, '#fxa-signin-header'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))

        .then(fillOutSignIn(this, email, PASSWORD))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
          // user should be able to click on a sync preferences button.
          .then(click('#sync-preferences'))
          // browser is notified of desire to open Sync preferences
          .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'))
          .closeCurrentWindow()
        .switchToWindow('')

        // about:accounts will take over post-verification, no transition
        .sleep(2000)
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(noSuchElement(this, '#fxa-sign-in-complete-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(this, PAGE_URL, '#fxa-signin-header'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))

        .then(fillOutSignIn(this, email, PASSWORD))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(openVerificationLinkDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .sleep(2000)
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(noSuchElement(this, '#fxa-sign-in-complete-header'));
    },

    'unverified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(openPage(this, PAGE_URL, '#fxa-signin-header'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))

        .then(fillOutSignIn(this, email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    }
  });
});
