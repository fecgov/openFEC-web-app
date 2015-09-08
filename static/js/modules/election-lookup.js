'use strict';

/* global require, module, window, document, context */

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

function formatResult(result, lookup) {
  return _.extend({}, result, {
    officeName: officeMap[result.office],
    electionName: formatName(result),
    electionDate: formatElectionDate(result),
    incumbent: formatIncumbent(result),
    color: formatColor(result, lookup),
    url: formatUrl(result),
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

function formatIncumbent(result) {
  if (result.incumbent_id) {
    return {
      name: result.incumbent_name,
      url: '/candidate/' + result.incumbent_id
    };
  } else {
    return null;
  }
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

function formatColor(result, lookup) {
  return lookup.map.colorMap ?
    lookup.map.colorMap[utils.encodeDistrict(result.state, result.district)] || '#000000' :
    '#000000';
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
  this.$cycle = this.$form.find('[name="cycle"]');
  this.$resultsItems = this.$elm.find('.results-items');
  this.$resultsTitle = this.$elm.find('.results-title');

  this.$map = $('.election-map');
  this.map = new ElectionLookupMap(this.$map.get(0), {
    handleSelect: this.handleSelectMap.bind(this)
  });

  this.$zip.on('change', this.handleZipChange.bind(this));
  this.$state.on('change', this.handleStateChange.bind(this));
  this.$form.on('change', 'input,select', this.search.bind(this));
  this.$form.on('submit', this.search.bind(this));
  $(window).on('popstate', this.handlePopState.bind(this));

  this.handlePopState();
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
  return helpers.buildUrl(['elections', 'search'], query);
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

ElectionLookup.prototype.search = function(e, opts) {
  e && e.preventDefault();
  opts = _.extend({pushState: true}, opts || {});
  var self = this;
  var serialized = self.serialize();
  if (self.shouldSearch(serialized) && !_.isEqual(serialized, self.serialized)) {
    $.getJSON(self.getUrl(serialized)).done(function(response) {
      // Note: Update district color map before rendering results
      self.drawDistricts(response.results);
      self.draw(response.results);
    });
    self.serialized = serialized;
    if (opts.pushState) {
      window.history.pushState(serialized, null, URI('').query(serialized).toString());
    }
  }
};

ElectionLookup.prototype.handlePopState = function() {
  var params = URI.parseQuery(window.location.search);
  this.$zip.val(params.zip);
  this.$state.val(params.state);
  this.$district.val(params.district);
  this.$cycle.val(params.cycle || this.$cycle.val());
  this.search(null, {pushState: false});
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
  return serialized.zip || serialized.state;
};

ElectionLookup.prototype.draw = function(results) {
  this.$resultsItems.html(resultTemplate(_.map(results, _.partial(formatResult, _, this))));
  this.$resultsTitle.text(this.getTitle());
  this.updateLocations();
};

/**
 * Fetch location image if not cached, then add to relevant districts
 */
ElectionLookup.prototype.updateLocations = function() {
  var self = this;
  var svg = self.$svg || $.get('/static/img/i-map--primary.svg').then(function(document) {
    self.$svg = $(document.querySelector('svg'));
    return self.$svg;
  });
  $.when(svg).done(self.drawLocations.bind(self));
};

/**
 * Append highlighted location images to relevant districts
 * @param {jQuery} $svg - SVG element
 */
ElectionLookup.prototype.drawLocations = function($svg) {
  this.$resultsItems.find('[data-color]').each(function(_, elm) {
    var $elm = $(elm);
    var $clone = $svg.clone();
    $clone.find('path').css('fill', $elm.data('color'));
    $elm.prepend($clone);
  });
};

ElectionLookup.prototype.getTitle = function() {
  var params = this.serialized;
  var title = params.cycle + ' candidates';
  if (params.zip) {
    title += ' in zip code ' + params.zip;
  } else {
    title += ' in ' + params.state;
    if (params.district && params.district !== '00') {
       title += ', district ' + params.district;
    }
  }
  return title;
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
  this.overlay = null;
  this.districts = null;
  this.colorMap = null;
  this.map = L.map(this.elm);
  L.tileLayer.provider('Stamen.TonerLite').addTo(this.map);
  this.drawDistricts();
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
  if (opts.reset && !_.isEqual(districts, this.districts)) {
    this.setColors(features.features);
  }
  this.districts = districts;
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

ElectionLookupMap.prototype.setColors = function(features) {
  var colorOptions = _.map(Object.keys(this.opts.colorScale), function(key) {
    return parseInt(key);
  });
  var minColors = Math.min.apply(null, colorOptions);
  var maxColors = Math.max.apply(null, colorOptions);
  var numColors = Math.max(minColors, Math.min(features.length, maxColors));
  var colors = this.opts.colorScale[numColors];
  this.colorMap = _.chain(features)
    .map(function(feature, index) {
      return [feature.id, colors[index % colors.length]];
    })
    .object()
    .value();
};

ElectionLookupMap.prototype.onEachFeature = function(feature, layer) {
  layer.setStyle({color: this.colorMap[feature.id]});
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
