'use strict';

/* global require, module, document, context, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');
var colorbrewer = require('colorbrewer');

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

function hasOption($select, value) {
  return $select.find('option[value="' + value + '"]').length > 0;
}

function ElectionLookup(selector) {
  this.$elm = $(selector);
  this.init();
}

ElectionLookup.prototype.init = function() {
  this.districts = 0;
  this.serialized = {};

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

ElectionLookup.prototype.handleSelectMap = function(state, district) {
  this.$zip.val('');
  this.$state.val(state);
  this.updateDistricts(state);
  if (district && hasOption(this.$district, district)) {
    this.$district.val(district);
  }
  this.search();
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
  this.$zip.val('');
  var state = this.$state.val();
  this.updateDistricts(state);
  if (state && !this.districts) {
    this.search();
  }
};

ElectionLookup.prototype.updateDistricts = function(state) {
  state = state || this.$state.val();
  this.$zip.val('');
  this.districts = context.districts[state] ? context.districts[state].districts : 0;
  this.$district
    .html(districtTemplate(_.range(1, this.districts + 1)))
    .val('')
    .prop('disabled', !(state && this.districts));
};

ElectionLookup.prototype.search = function(e) {
  e && e.preventDefault();
  var self = this;
  var serialized = self.serialize();
  if (self.shouldSearch(serialized) && !_.isEqual(serialized, self.serialized)) {
    $.getJSON(self.getUrl(serialized)).done(function(response) {
      self.draw(response.results);
      self.drawDistricts(response.results);
    });
    self.serialized = serialized;
  }
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
  if (state) {
    encoded.push(utils.encodeDistrict(state, district));
  }
  encoded = _.unique(encoded);
  if (encoded.length) {
    this.map.drawDistricts(encoded);
  }
};

ElectionLookup.prototype.shouldSearch = function(serialized) {
  return serialized.zip ||
    (serialized.state && serialized.district) ||
    (serialized.state && this.districts === 0);
};

ElectionLookup.prototype.draw = function(results) {
  this.$resultsItems.html(resultTemplate(_.map(results, formatResult)));
};

var defaultOpts = {
  colorScale: colorbrewer.Set1
};

function ElectionLookupMap(elm, opts) {
  this.elm = elm;
  this.opts = _.extend({}, defaultOpts, opts);
  this.init();
}

ElectionLookupMap.prototype.init = function() {
  this.colors = null;
  this.overlay = null;
  this.districts = null;
  this.map = L.map(this.elm);
  L.tileLayer.provider('Stamen.TonerLite').addTo(this.map);
  this.drawDistricts();
};

ElectionLookupMap.prototype.setColors = function(features) {
  var colorOptions = _.map(Object.keys(this.opts.colorScale), function(key) {
    return parseInt(key);
  });
  var minColors = Math.min.apply(null, colorOptions);
  var maxColors = Math.max.apply(null, colorOptions);
  var numColors = Math.max(minColors, Math.min(features.length, maxColors));
  this.colors = this.opts.colorScale[numColors];
};

ElectionLookupMap.prototype.updateFeatureColors = function(districts, features, opts) {
  var self = this;
  if (opts.reset && !_.isEqual(districts, this.districts)) {
    _.each(features, function(feature, index) {
      feature._color = self.colors[index % self.colors.length];
    });
  }
  self.districts = districts;
};

ElectionLookupMap.prototype.drawDistricts = function(districts, opts) {
  var self = this;
  opts = _.extend({reset: true}, opts);
  var features = districts ?
    this.filterDistricts(districts) :
    utils.districtFeatures;
  if (this.overlay) {
    this.map.removeLayer(this.overlay);
  }
  this.setColors(features.features);
  this.updateFeatureColors(districts, features.features, opts);
  this.overlay = L.geoJson(
    features, {
      onEachFeature: this.onEachFeature.bind(this)
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

ElectionLookupMap.prototype.onEachFeature = function(feature, layer) {
  layer.setStyle({color: feature._color});
  layer.on('click', this.handleClick.bind(this));
};

ElectionLookupMap.prototype.handleClick = function(e) {
  this.map.removeLayer(this.overlay);
  this.drawDistricts([e.target.feature.id], {reset: false});
  if (this.opts.handleSelect) {
    var district = utils.decodeDistrict(e.target.feature.id);
    this.opts.handleSelect(district.state, district.district);
  }
};

module.exports = {
  ElectionLookup: ElectionLookup,
  ElectionLookupMap: ElectionLookupMap
};
