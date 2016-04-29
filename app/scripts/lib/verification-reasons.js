/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * List of reasons a user must perform some form of verification.
 */

define(function (require, exports, module) {
  'use strict';

  var Enum = require('lib/enum');

  return new Enum({
    ACCOUNT_UNLOCK: 'account_unlock',
    FORCE_AUTH: 'force_auth',
    PASSWORD_RESET: 'reset_password',
    SIGN_IN: 'login',
    SIGN_UP: 'signup'
  });
});

