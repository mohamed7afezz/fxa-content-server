/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');

  var Enumerable = {
    /**
     * Check if the value matches the given key's value
     *
     * @param {string} value
     * @param {string} key
     * @returns {boolean} `undefined` if key does not exist in enumerable,
     *   `true` if value matches key value, `false` otw.
     */
    is: function (value, key) {
      if (this.hasOwnProperty(key)) {
        return value === this[key];
      }
    },

    /**
     * Return the key associated with the value.
     *
     * @param {string} value - value to find.
     * @returns {string} key matching the value if found, undefined otw.
     */
    keyOf: function (value) {
      for (var key in this) {
        if (this.is(value, key)) {
          return key;
        }
      }
    }
  };

  return function (items) {
    return _.extend(Object.create(Enumerable), items);
  };
});

