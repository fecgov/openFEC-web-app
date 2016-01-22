'use strict';

/* global Intl, BASE_PATH, API_LOCATION, API_VERSION, API_KEY */

var URI = require('urijs');
var _ = require('underscore');
var decoders = require('./decoders');
var Handlebars = require('hbsfy/runtime');

var helpers = require('fec-style/js/helpers');

var intl = require('intl');
var locale = require('intl/locale-data/json/en-US.json');
intl.__addLocaleData(locale);

var datetime = helpers.datetime;
Handlebars.registerHelper('datetime', datetime);

var currencyFormatter = Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
function currency(value) {
  if (!isNaN(parseInt(value))) {
    return currencyFormatter.format(value);
  } else {
    return null;
  }
}
Handlebars.registerHelper('currency', currency);

var numberFormatter = Intl.NumberFormat('en-US');
Handlebars.registerHelper('formatNumber', numberFormatter.format);

Handlebars.registerHelper({
  eq: function (v1, v2) {
    return v1 === v2;
  }
});

var globals = {
  EARMARKED_CODE: '15E'
};

Handlebars.registerHelper('global', function(value) {
  return globals[value];
});

function decodeAmendment(value) {
  return decoders.amendments[value];
});

function decodeOffice(value) {
  return decoders.office[value];
});

Handlebars.registerHelper('decodeSupportOppose', function(value) {
  return decoders.supportOppose[value] || 'Unknown';
});

Handlebars.registerHelper('decodeForm', function(value) {
  return decoders.forms[value] || value;
});

Handlebars.registerHelper('decodeReport', function(value) {
  return decoders.reports[value] || value;
}

Handlebars.registerHelper('decodeAmendment', decodeAmendment);

Handlebars.registerHelper('decodeOffice', decodeOffice);

Handlebars.registerHelper('decodeSupportOppose', decodeSupportOppose);

Handlebars.registerHelper('decodeForm', decodeForm);

Handlebars.registerHelper('decodeReport', decodeReport);

Handlebars.registerHelper('basePath', BASE_PATH);

function cycleDates(year) {
  return {
    min: '01-01-' + (year - 1),
    max: '12-31-' + year
  };
}

function ensureArray(value) {
  return _.isArray(value) ? value : [value];
}

function filterNull(params) {
  return _.chain(params)
    .pairs()
    .filter(function(pair) {
      return pair[1] !== '';
    })
    .object()
    .value();
}

function buildAppUrl(path, query) {
  return URI('')
    .path(Array.prototype.concat(BASE_PATH, path || [], '').join('/'))
    .addQuery(query || {})
    .toString();
}

function buildUrl(path, query) {
  return URI(API_LOCATION)
    .path(Array.prototype.concat(API_VERSION, path, '').join('/'))
    .addQuery({api_key: API_KEY})
    .addQuery(query)
    .toString();
}

module.exports = {
  currency: currency,
  ensureArray: ensureArray,
  datetime: datetime,
  formatNumber: numberFormatter.format,
  cycleDates: cycleDates,
  filterNull: filterNull,
  buildAppUrl: buildAppUrl,
  buildUrl: buildUrl,
  globals: globals
};
