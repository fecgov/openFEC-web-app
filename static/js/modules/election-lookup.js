'use strict';

/* global require, module, document, context, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');

var L = require('leaflet');
require('leaflet-providers');

var helpers = require('./helpers');
var utils = require('./election-utils');

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
  var date = moment()
    .year(result.cycle)
    .month('November')
    .date(1);
  while (date.format('E') !== '1') {
    date = date.add(1, 'day');
  }
  return date
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

  this.$search = this.$elm.find('.search');
  this.$form = this.$elm.find('form');
  this.$zip = this.$form.find('[name="zip"]');
  this.$state = this.$form.find('[name="state"]');
  this.$district = this.$form.find('[name="district"]');
  this.$results = this.$elm.find('.results');
  this.$resultsItems = this.$elm.find('.results-items');

  this.$map = $('.election-map');
  this.map = new ElectionLookupMap(this.$map.get(0), {
    handleSelect: this.handleSelectMap.bind(this)
  });

  this.$zip.on('change', this.handleZipChange.bind(this));
  this.$state.on('change', this.handleStateChange.bind(this));
  this.$form.on('change', 'input,select', this.search.bind(this));
  this.$form.on('submit', this.search.bind(this));

  this.handleStateChange();
};

function hasOption($select, value) {
  return $select.find('option[value="' + value + '"]').length > 0;
}

ElectionLookup.prototype.handleSelectMap = function(state, district) {
  this.$state.val(state).change();
  if (district && hasOption(this.$district, district)) {
    this.$district.val(district).change();
  }
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
      self.drawDistricts(response.results);
    });
  }
  var url = self.getUrl(this.serialize());
};

ElectionLookup.prototype.drawDistricts = function(results) {
  var encoded = _.chain(results)
    .filter(function(result) {
      return result.state && result.district;
    })
    .map(function(result) {
      return utils.encodeDistrict(result.state, result.district);
    })
    .value();
  var state = this.$state.val();
  var district = this.$district.val();
  encoded.push(utils.encodeDistrict(state, district));
  this.map.drawDistricts(_.unique(encoded));
};

ElectionLookup.prototype.shouldSearch = function(serialized) {
  return serialized.zip ||
    (serialized.state && serialized.district) ||
    (serialized.state && this.districts === 0);
};

ElectionLookup.prototype.draw = function(results) {
  this.$resultsItems.html(resultTemplate(_.map(results, formatResult)));
};

function ElectionLookupMap(elm, opts) {
  this.elm = elm;
  this.opts = opts;
  this.init();
}

ElectionLookupMap.prototype.init = function() {
  this.map = L.map(this.elm);
  L.tileLayer.provider('Stamen.TonerLite').addTo(this.map);
  this.overlay = null;
  this.drawDistricts();
};

ElectionLookupMap.prototype.drawDistricts = function(districts) {
  var features = districts ?
    this.filterDistricts(districts) :
    utils.districtFeatures;
  if (this.overlay) {
    this.map.removeLayer(this.overlay);
  }
  this.overlay = L.geoJson(
    features, {
      onEachFeature: this.bindDistrictListener.bind(this)
  }).addTo(this.map);
  if (districts) {
    this.map.fitBounds(this.overlay.getBounds());
  } else {
    this.map.setView([37.8, -96], 3);
  }
};

ElectionLookupMap.prototype.filterDistricts = function(districts) {
  return {
    type: utils.districtFeatures.type,
    features: utils.findDistricts(districts)
  };
};

ElectionLookupMap.prototype.bindDistrictListener = function(feature, layer) {
  layer.on('click', this.handleClick.bind(this));
};

ElectionLookupMap.prototype.handleClick = function(e) {
  this.map.removeLayer(this.overlay);
  this.drawDistricts([e.target.feature.id]);
  if (this.opts.handleSelect) {
    var district = utils.decodeDistrict(e.target.feature.id);
    this.opts.handleSelect(district.state, district.district);
  }
};

module.exports = {
  ElectionLookup: ElectionLookup,
  ElectionLookupMap: ElectionLookupMap
};
