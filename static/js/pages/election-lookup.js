'use strict';

/* global require, module, document, context, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var ElectionLookup = require('../modules/election-lookup').ElectionLookup;

$(document).ready(function() {
  new ElectionLookup('#election-lookup');
});
