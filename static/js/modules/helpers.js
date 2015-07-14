'use strict';

/* global require */

var intl = require('intl');
var moment = require('moment');
var Handlebars = require('hbsfy/runtime');

Handlebars.registerHelper('currency', function(value) {
  if (!isNaN(parseInt(value))) {
    return '$' + intl.NumberFormat(undefined, {minimumFractionDigits: 2}).format(value);
  } else {
    return null;
  }
});

Handlebars.registerHelper('datetime', function(value) {
  var parsed = moment(value, 'YYYY-MM-DDTHH:mm:ss');
  return parsed.isValid() ? parsed.format('MM-DD-YYYY') : null;
});
