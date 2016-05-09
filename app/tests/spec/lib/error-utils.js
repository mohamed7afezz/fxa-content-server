/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var ErrorUtils = require('lib/error-utils');
  var OAuthErrors = require('lib/oauth-errors');
  var sinon = require('sinon');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('lib/error-utils', function () {
    var err;
    var metrics;
    var sentry;
    var sandbox;
    var windowMock;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();

      metrics = {
        flush: sinon.spy(),
        logError: sinon.spy()
      };

      sentry = {
        captureException: sinon.spy()
      };

      windowMock = new WindowMock();
      sandbox.spy(windowMock.console, 'error');
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('getErrorPageUrl', function () {
      var badRequestPageErrors = [
        AuthErrors.toInvalidParameterError('paramName'),
        AuthErrors.toMissingParameterError('paramName'),
        OAuthErrors.toInvalidParameterError('paramName'),
        OAuthErrors.toMissingParameterError('paramName'),
        OAuthErrors.toError('UNKNOWN_CLIENT')
      ];

      badRequestPageErrors.forEach(function (err) {
        it('redirects to BAD_REQUEST_PAGE for ' + err.message, function () {
          var errorPageUrl = ErrorUtils.getErrorPageUrl(err);
          assert.include(errorPageUrl, Constants.BAD_REQUEST_PAGE);
        });
      });

      it('returns INTERNAL_ERROR_PAGE by default', function () {
        var errorPageUrl =
          ErrorUtils.getErrorPageUrl(OAuthErrors.toError('INVALID_ASSERTION'));
        assert.include(errorPageUrl, Constants.INTERNAL_ERROR_PAGE);
      });
    });

    describe('getDisplayedErrorMessage', function () {
      describe('with an internal error', function () {
        it('returns the interpolated message', function () {
          var err = AuthErrors.toInvalidParameterError('email');
          assert.equal(ErrorUtils.getDisplayedErrorMessage(err), 'Invalid parameter: email');
        });
      });

      describe('with a normal exception', function () {
        it('returns the exceptions `message`', function () {
          var err = new Error('boom');
          assert.equal(ErrorUtils.getDisplayedErrorMessage(err), 'boom');
        });
      });
    });

    describe('captureError', function () {
      beforeEach(function () {
        err = AuthErrors.toError('UNEXPECTED_ERROR');
        return ErrorUtils.captureError(err, sentry, metrics, windowMock);
      });

      it('logs the error to both metrics', function () {
        assert.isTrue(sentry.captureException.calledWith(err));
        assert.isTrue(metrics.logError.calledWith(err));
      });

      it('writes an error message to the console', function () {
        assert.isTrue(windowMock.console.error.called);
      });
    });

    describe('captureAndFlushError', function () {
      beforeEach(function () {
        err = AuthErrors.toError('UNEXPECTED_ERROR');
        return ErrorUtils.captureAndFlushError(
          err, sentry, metrics, windowMock);
      });

      it('logs the error to both metrics', function () {
        assert.isTrue(sentry.captureException.calledWith(err));
        assert.isTrue(metrics.logError.calledWith(err));
      });

      it('writes an error message to the console', function () {
        assert.isTrue(windowMock.console.error.called);
      });

      it('flushes metrics', function () {
        assert.isTrue(metrics.flush.called);
      });
    });

    describe('fatalError', function () {
      var translator;

      beforeEach(function () {
        err = AuthErrors.toError('UNEXPECTED_ERROR');

        // set the timeout to 0 to speed up the tests.
        ErrorUtils.ERROR_REDIRECT_TIMEOUT_MS = 0;
        return ErrorUtils.fatalError(
          err, sentry, metrics, windowMock, translator);
      });

      it('logs the error to both metrics', function () {
        assert.isTrue(sentry.captureException.calledWith(err));
        assert.isTrue(metrics.logError.calledWith(err));
      });

      it('writes an error message to the console', function () {
        assert.isTrue(windowMock.console.error.called);
      });

      it('flushes metrics', function () {
        assert.isTrue(metrics.flush.called);
      });

      it('sets `cookie.__400_message` for display on the error page', function () {
        assert.equal(
          windowMock.document.cookie, '__400_message=Unexpected error; path=/400.html;');
      });

      it('redirects the user to the error page', function () {
        assert.include(windowMock.location.href, '500.html');
      });
    });
  });
});
