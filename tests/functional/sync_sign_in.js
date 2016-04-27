/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers,
  FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';
  var PAGE_URL_WITH_MIGRATION = PAGE_URL + '&migration=sync11';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotifiedOfLogin = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfLogin);
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'Firefox Desktop Sync v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(clearBrowserState(this));
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(this, PAGE_URL, '#fxa-signin-header'))
        .execute(listenForFxaCommands)

        .then(fillOutSignIn(this, email, PASSWORD))
        // for sync, a user must re-confirm their email address.
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(testIsBrowserNotifiedOfLogin(this, email))

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
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(this, PAGE_URL, '#fxa-signin-header'))
        .execute(listenForFxaCommands)

        .then(fillOutSignIn(this, email, PASSWORD))
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(testIsBrowserNotifiedOfLogin(this, email))

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
        .execute(listenForFxaCommands)

        .then(fillOutSignIn(this, email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        .then(testIsBrowserNotifiedOfLogin(this, email));
    },

    'as a migrating user': function () {
      return this.remote
        .then(openPage(this, PAGE_URL_WITH_MIGRATION, '#fxa-signin-header'))
        .then(visibleByQSA('.info.nudge'));
    }
  });
});
