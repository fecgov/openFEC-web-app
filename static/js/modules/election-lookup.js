'use strict';

/* global require, module, document, context, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');

var helpers = require('./helpers');

var districtTemplate = require('../../templates/districts.hbs');
var resultTemplate = require('../../templates/electionResult.hbs');

var officeMap = {
  P: 'President',
  S: 'Senate',
  H: 'House'
};

function serializeObject($form) {
  return _.chain($form.serializeArray())
    .map(function(obj) {
      return [obj.name, obj.value];
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
  this.districts = 0;
  this.hasResults = false;

  this.$search = this.$elm.find('.search');
  this.$form = this.$elm.find('form');
  this.$zip = this.$form.find('[name="zip"]');
  this.$state = this.$form.find('[name="state"]');
  this.$district = this.$form.find('[name="district"]');
  this.$results = this.$elm.find('.results');
  this.$resultsItems = this.$elm.find('.results-items');
  this.$searchPopulated = this.$elm.find('.search-populated');

  this.$zip.on('change', this.handleZipChange.bind(this));
  this.$state.on('change', this.handleStateChange.bind(this));
  this.$form.on('change', 'input,select', this.search.bind(this));
  this.$form.on('submit', this.search.bind(this));

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
  var params = serializeObject(this.$form);
  return _.extend(helpers.filterNull(params));
};

ElectionLookup.prototype.handleZipChange = function() {
  this.$state.val('');
  this.$district.val('');
};

ElectionLookup.prototype.handleStateChange = function() {
  var value = this.$state.val();
  this.$zip.val('');
  this.districts = context.districts[value] ? context.districts[value].districts : 0;
  this.$district
    .html(districtTemplate(_.range(1, this.districts + 1)))
    .val('')
    .prop('disabled', !(value && this.districts));
  if (value && !this.districts) {
    this.search();
  }
};

ElectionLookup.prototype.search = function(event) {
  event && event.preventDefault();
  var self = this;
  var serialized = self.serialize();
  if (self.shouldSearch(serialized)) {
    $.getJSON(self.getUrl(serialized)).done(function(response) {
      self.draw(response.results);
    });
  }
  var url = self.getUrl(this.serialize());
};

ElectionLookup.prototype.shouldSearch = function(serialized) {
  return serialized.zip ||
    (serialized.state && serialized.district) ||
    (serialized.state && this.districts === 0);
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

module.exports = {
  ElectionLookup: ElectionLookup
};
