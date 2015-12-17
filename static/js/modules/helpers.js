'use strict';

/* global Intl, BASE_PATH, API_LOCATION, API_VERSION, API_KEY */

var URI = require('urijs');
var _ = require('underscore');
var moment = require('moment');
var decoders = require('./decoders');
var Handlebars = require('hbsfy/runtime');

var intl = require('intl');
var locale = require('intl/locale-data/json/en-US.json');
intl.__addLocaleData(locale);

var currencyFormatter = Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
function currency(value) {
  if (!isNaN(parseInt(value))) {
    return currencyFormatter.format(value);
  } else {
    return null;
  }
}
Handlebars.registerHelper('currency', currency);

function datetime(value, options) {
  var hash = options.hash || {};
  var format = hash.pretty ? 'MMM D, YYYY' : 'MM-DD-YYYY';
  var parsed = moment(value, 'YYYY-MM-DDTHH:mm:ss');
  return parsed.isValid() ? parsed.format(format) : null;
}

function decodeAmendment(value) {
  return decoders.amendments[value];
}

Handlebars.registerHelper('datetime', datetime);

Handlebars.registerHelper('decodeAmendment', decodeAmendment);

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
  datetime: datetime,
  ensureArray: ensureArray,
  decodeAmendment: decodeAmendment,
  cycleDates: cycleDates,
  filterNull: filterNull,
  buildAppUrl: buildAppUrl,
  buildUrl: buildUrl
};
