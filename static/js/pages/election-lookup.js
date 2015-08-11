'use strict';

/* global require, module, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');

var resultTemplate = require('../../templates/electionResult.hbs');

var officeMap = {
  P: 'President',
  S: 'Senate',
  H: 'House'
};

var year = new Date().getFullYear();
var cycle = year + year % 2;

function filterNull(params) {
  return _.chain(params)
    .pairs()
    .filter(function(pair) {
      return pair[1] !== '';
    })
    .object()
    .value();
}

function formatResult(result) {
  return _.extend({}, result, {
    officeName: officeMap[result.office],
    electionName: formatName(result),
    electionDate: formatElectionDate(result),
    url: formatUrl(result)
  });
}

function formatName(result) {
  var parts = [result.state, officeMap[result.office]];
  if (result.district) {
    parts = parts.concat('District ' + result.district.toString());
  }
  return parts.join(' ');
}

function formatElectionDate(result) {
  return moment()
    .year(result.cycle)
    .month('November')
    .day('Monday')
    .add(1, 'day')
    .format('MMMM Do, YYYY');
}

function formatUrl(result) {
  var path = ['/elections', officeMap[result.office].toLowerCase()];
  if (['S', 'H'].indexOf(result.office) !== -1) {
    path = path.concat(result.state);
  }
  if (result.office === 'H') {
    path = path.concat(result.district);
  }
  path = path.concat(result.cycle);
  return URI(path.join('/')).toString();
}

function ElectionLookup(selector) {
  this.$elm = $(selector);
  this.init();
}

ElectionLookup.prototype.init = function() {
  this.hasResults = false;

  this.$search = this.$elm.find('.search');
  this.$zip = this.$elm.find('[name="zip"]');
  this.$state = this.$elm.find('[name="state"]');
  this.$district = this.$elm.find('[name="district"]');
  this.$results = this.$elm.find('.results');
  this.$resultsItems = this.$elm.find('.results-items');
  this.$searchPopulated = this.$elm.find('.search-populated');

  this.$zip.on('change', this.search.bind(this));
  this.$district.on('change', this.search.bind(this));
  this.$state.on('change', this.handleStateChange.bind(this));

  this.handleStateChange();
  this.$results.hide();
};

ElectionLookup.prototype.getUrl = function(query) {
  return URI(API_LOCATION)
    .path([API_VERSION, 'elections', 'search'].join('/'))
    .query(query)
    .toString();
};

ElectionLookup.prototype.serialize = function() {
  var params = {
    zip: this.$zip.val(),
    state: this.$state.val(),
    district: this.$district.val()
  };
  return _.extend({cycle: cycle}, filterNull(params));
};

ElectionLookup.prototype.handleStateChange = function() {
  var value = this.$state.val();
  this.$district.prop('disabled', value === '');
  this.$district.val('');
};

ElectionLookup.prototype.search = function() {
  var self = this;
  var serialized = self.serialize();
  if (serialized.zip || (serialized.state && serialized.district)) {
    $.getJSON(self.getUrl(serialized)).done(function(response) {
      self.draw(response.results);
    });
  }
  var url = self.getUrl(this.serialize());
};

ElectionLookup.prototype.draw = function(results) {
  this.$resultsItems.html(resultTemplate(_.map(results, formatResult)));
  if (!this.hasResults) {
    var $search = this.$search.detach();
    this.$searchPopulated.append($search);
    this.$results.show();
    this.hasResults = true;
  }
};

$(document).ready(function() {
  new ElectionLookup('#election-lookup');
});

module.exports = {
  ElectionLookup: ElectionLookup
};
