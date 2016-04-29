/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var Enum = require('lib/enum');

  describe('lib/enum', function () {
    var enumerable;

    before(function () {
      enumerable = new Enum({
        ALIAS: 'value'
      });
    });

    describe('creation', function () {
      it('exports the correct interface', function () {
        assert.lengthOf(Object.keys(enumerable), 1);
        assert.isTrue('ALIAS' in enumerable);
        assert.equal(enumerable.ALIAS, 'value');

        assert.isFunction(enumerable.is);
        assert.isFunction(enumerable.keyOf);
      });
    });

    describe('is', function () {
      it('returns `true` for a matching value', function () {
        assert.isTrue(enumerable.is('value', 'ALIAS'));
      });

      it('returns `false` for a non-matching value', function () {
        assert.isFalse(enumerable.is('non-matching-value', 'ALIAS'));
      });

      it('returns `undefined` for a non-existent key', function () {
        assert.isUndefined(enumerable.is('non-matching-value', 'NOT-A-KEY'));
      });

    });

    describe('keyOf', function () {
      it('returns the key if the value is found', function () {
        assert.equal(enumerable.keyOf('value'), 'ALIAS');
      });

      it('returns `undefined` if the value is not found', function () {
        assert.isUndefined(enumerable.keyOf('not-an-item'));
      });
    });
  });
});

