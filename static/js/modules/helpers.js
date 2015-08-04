'use strict';

/* global require, module, Intl */

var moment = require('moment');
var Handlebars = require('hbsfy/runtime');

var intl = require('intl');
var locale = require('intl/locale-data/json/en-US.json');
intl.__addLocaleData(locale);

function currency(value) {
  if (!isNaN(parseInt(value))) {
    return '$' + Intl.NumberFormat(undefined, {minimumFractionDigits: 2}).format(value);
  } else {
    return null;
  }
}
Handlebars.registerHelper('currency', currency);

function datetime(value) {
  var parsed = moment(value, 'YYYY-MM-DDTHH:mm:ss');
  return parsed.isValid() ? parsed.format('MM-DD-YYYY') : null;
}
Handlebars.registerHelper('datetime', datetime);

function cycleDates(value) {
  var secondYear = value;
  var firstYear = secondYear - 1;
  var min_date = '01-01-' + firstYear;
  var max_date = '12-31-' + secondYear;
  return { min_date: min_date, max_date: max_date };
}

module.exports = {
  currency: currency,
  datetime: datetime,
  cycleDates: cycleDates,
};
