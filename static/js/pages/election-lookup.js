'use strict';

/* global require, module, document, context, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var lookup = require('../modules/election-lookup');

$(document).ready(function() {
  new lookup.ElectionLookup('#election-lookup');
});
