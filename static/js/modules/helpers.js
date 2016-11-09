'use strict';

/* global Intl, BASE_PATH, API_LOCATION, API_VERSION, API_KEY */

var URI = require('urijs');
var $ = require('jquery');
var _ = require('underscore');
var decoders = require('./decoders');
var Handlebars = require('hbsfy/runtime');

var helpers = require('fec-style/js/helpers');

var intl = require('intl');
var locale = require('intl/locale-data/json/en-US.json');
intl.__addLocaleData(locale);

var datetime = helpers.datetime;
var isLargeScreen = helpers.isLargeScreen;
var isMediumScreen = helpers.isMediumScreen;

Handlebars.registerHelper('datetime', datetime);

var currencyFormatter = Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
function currency(value) {
  if (!isNaN(parseInt(value))) {
    return currencyFormatter.format(value);
  } else {
    return '--';
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

Handlebars.registerHelper('decodeAmendment', function(value) {
  return decoders.amendments[value];
});

Handlebars.registerHelper('decodeOffice', function(value) {
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
});

Handlebars.registerHelper('decodeState', function(value) {
  return decoders.states[value] || value;
});

Handlebars.registerHelper('decodeParty', function(value) {
  return decoders.parties[value] || value;
});

Handlebars.registerHelper('decodeMeans', function(value) {
  return decoders.means[value] || value;
});

Handlebars.registerHelper('basePath', BASE_PATH);

Handlebars.registerHelper('panelRow', function(label, options) {
  return new Handlebars.SafeString(
    '<tr>' +
      '<td class="panel__term">' + label + '</td>' +
      '<td class="panel__data">' + options.fn(this) + '</td>' +
    '</tr>'
  );
});

Handlebars.registerHelper('entityUrl', function(entity, options) {
  var query,
      id,
      url;
  if (options.hash.query) {
    query = {
      cycle: options.hash.query.cycle || null,
      election_full: options.hash.query.election_full || null
    };
  }
  id = entity.candidate_id || entity.committee_id;
  url = buildAppUrl([options.hash.type, id], query);
  return new Handlebars.SafeString(url);
});

Handlebars.registerHelper('electionUrl', function(year, options) {
  var url;
  var candidate = options.hash.parentContext;

  if (candidate.office === 'P') {
    url = buildAppUrl(['elections', 'president', year]);
  } else if (candidate.office === 'S') {
    url = buildAppUrl(['elections', 'senate', candidate.state, year]);
  } else if (candidate.office === 'H') {
    // Match election years with the election district
    var district = candidate.election_districts[options.hash.index];
    url = buildAppUrl(['elections', 'house', candidate.state, district, year]);
  }
  return new Handlebars.SafeString(url);
});

Handlebars.registerHelper('convertBoolean', function(bool) {
  if (bool) {
    return new Handlebars.SafeString('Yes');
  } else {
    return new Handlebars.SafeString('No');
  }
});

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

function getTimePeriod(electionYear, cycle, electionFull, office) {
  var durations = {
    P: 3,
    S: 5,
    H: 1
  };
  var min,
      max,
      duration = durations[office];

  if (electionFull) {
    min = parseInt(electionYear) - duration;
    max = electionYear;
  } else {
    min = parseInt(cycle) - 1;
    max = cycle;
  }

  return min.toString() + '–' + max.toString();

}

/*
* zeroPad: used to add decimals to numbers in order to right-align them
* It does so by getting the width of a container element, measuring the length
* of an item, and then appending decimals until the item is as long as the container
*
* @param container: a selector for the item to use as the maxWidth
* @param item: a selector for the items whose width we will equalize
* @param appendee (optional): what to append the decimal to
*/

function zeroPad(container, item, appendee) {
  // Subtract 2 so if it's close we don't go over
  var maxWidth = $(container).width() - 6;
  $(container).find(appendee).empty();
  $(container).find(item).each(function() {
    var itemWidth = $(this).width();
    // $appendee is where the period will be appended to
    // You can pass either a child element of item or else it will be appended
    // to item itself
    var $appendee = appendee ? $(this).find(appendee) : $(this);
    var value = $appendee.text();
    while ( itemWidth < maxWidth) {
      value = '.' + value;
      $appendee.text(value);
      itemWidth = $(this).width();
    }
  });
}

module.exports = {
  buildAppUrl: buildAppUrl,
  buildUrl: buildUrl,
  currency: currency,
  cycleDates: cycleDates,
  datetime: datetime,
  ensureArray: ensureArray,
  filterNull: filterNull,
  formatNumber: numberFormatter.format,
  getTimePeriod: getTimePeriod,
  globals: globals,
  isLargeScreen: isLargeScreen,
  isMediumScreen: isMediumScreen,
  LOADING_DELAY: helpers.LOADING_DELAY,
  SUCCESS_DELAY: helpers.SUCCESS_DELAY,
  zeroPad: zeroPad
};
