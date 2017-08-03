'use strict';

/* global require, document */

var $ = require('jquery');
var lookup = require('../modules/election-lookup');

$(document).ready(function() {
  new lookup.ElectionLookup('#election-lookup', true);
});
