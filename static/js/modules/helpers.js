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
  if (options.hash.query) {
    var query = {
      cycle: options.hash.query.cycle || null,
      election_full: options.hash.query.election_full || null
    };
  }
  var id = entity.candidate_id || entity.committee_id;
  var url = buildAppUrl([options.hash.type, id], query);
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

module.exports = {
  currency: currency,
  ensureArray: ensureArray,
  datetime: datetime,
  formatNumber: numberFormatter.format,
  cycleDates: cycleDates,
  filterNull: filterNull,
  buildAppUrl: buildAppUrl,
  buildUrl: buildUrl,
  globals: globals,
  getTimePeriod: getTimePeriod
};
