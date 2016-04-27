/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers) {
  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var setupTest = thenify(function (context, isUserVerified) {
    return this.parent
      .then(clearBrowserState(context))
      .then(createUser(email, PASSWORD, { preVerified: isUserVerified }))
      .then(openForceAuth({ query: {
        context: 'fx_desktop_v2',
        email: email,
        service: 'sync'
      }}))
      .then(noSuchBrowserNotification(context, 'fxaccounts:logout'))
      .then(respondToWebChannelMessage(context, 'fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutForceAuth(PASSWORD))

      .then(testElementExists(isUserVerified ? '#fxa-confirm-signin-header' : '#fxa-confirm-header'))
      .then(testIsBrowserNotified(context, 'fxaccounts:can_link_account'))
      .then(testIsBrowserNotified(context, 'fxaccounts:login'));
  });

  registerSuite({
    name: 'Firefox Desktop Sync v2 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .closeCurrentWindow()
        .switchToWindow('')

        // about:accounts will take over post-verification, no transition
        .sleep(2000)
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(noSuchElement(this, '#fxa-sign-in-complete-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .sleep(2000)
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(noSuchElement(this, '#fxa-sign-in-complete-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false));
    }
  });
});
