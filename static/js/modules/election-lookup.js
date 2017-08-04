'use strict';

/* global window */

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');
var moment = require('moment');
var topojson = require('topojson');
var colorbrewer = require('colorbrewer');

var L = require('leaflet');
require('leaflet-providers');

var analytics = require('fec-style/js/analytics');

var helpers = require('./helpers');
var utils = require('./election-utils');
var decoders = require('./decoders');

var states = require('../data/us-states-10m.json');
var districts = require('../data/stateDistricts.json');

var stateFeatures = topojson.feature(states, states.objects.states).features;

var districtTemplate = require('../../templates/districts.hbs');
var resultTemplate = require('../../templates/electionResult.hbs');
var zipWarningTemplate = require('../../templates/electionZipWarning.hbs');
var noResultsTemplate = require('../../templates/electionNoResults.hbs');

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
    incumbent: formatIncumbent(result),
    color: formatColor(result, lookup),
    url: formatUrl(result),
  });
}

function formatName(result) {
  var parts = [decoders.states[result.state], officeMap[result.office]];
  if (result.district && result.district !== '00') {
    parts = parts.concat('District ' + result.district.toString());
  }
  return parts.join(' ');
}

function formatGenericElectionDate(result) {
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
      url: helpers.buildAppUrl(['candidate', result.incumbent_id])
    };
  } else {
    return null;
  }
}

function formatUrl(result) {
  var path = ['elections', officeMap[result.office].toLowerCase()];
  if (['S', 'H'].indexOf(result.office) !== -1) {
    path = path.concat(result.state);
  }
  if (result.office === 'H') {
    path = path.concat(result.district);
  }
  path = path.concat(result.cycle);
  return helpers.buildAppUrl(path, {});
}

function formatColor(result, lookup) {
  var palette = lookup.map.districtPalette[result.state] || {};
  return palette[result.district % palette.length] || '#000000';
}

function hasOption($select, value) {
  return $select.find('option[value="' + value + '"]').length > 0;
}

function getStatePalette(scale) {
  var colorOptions = _.map(Object.keys(scale), function(key) {
    return parseInt(key);
  });
  return scale[_.max(colorOptions)];
}

function getDistrictPalette(scale) {
  var colorOptions = _.map(Object.keys(scale), function(key) {
    return parseInt(key);
  });
  var minColors = Math.min.apply(null, colorOptions);
  var maxColors = Math.max.apply(null, colorOptions);
  return _.chain(utils.districtFeatures.features)
    .groupBy(function(feature) {
      var district = utils.decodeDistrict(feature.id);
      return district.state;
    })
    .map(function(features, state) {
      var numColors = Math.max(minColors, Math.min(features.length, maxColors));
      return [state, scale[numColors]];
    })
    .object()
    .value();
}

var ElectionFormMixin = {
  handleZipChange: function() {
    this.$state.val('').change();
    this.$district.val('');
  },

  handleStateChange: function() {
    var state = this.$state.val();
    this.updateDistricts(state);
    if (state) {
      this.$zip.val('');
    }
  },

  updateDistricts: function(state) {
    state = state || this.$state.val();
    this.districts = districts[state] ? districts[state].districts : 0;
    this.$district
      .html(districtTemplate(_.range(1, this.districts + 1)))
      .val('')
      .prop('disabled', !(state && this.districts));
  }
};

function ElectionLookup(selector, showResults) {
  this.$elm = $(selector);
  this.init();
  this.showResults = showResults;
}

_.extend(ElectionLookup.prototype, ElectionFormMixin);

ElectionLookup.prototype.init = function() {
  this.districts = 0;
  this.serialized = {};
  this.results = [];
  this.xhr = null;
  this.upcomingElections = [];

  this.$form = this.$elm.find('form');
  this.$zip = this.$form.find('[name="zip"]');
  this.$state = this.$form.find('[name="state"]');
  this.$district = this.$form.find('[name="district"]').prop('disabled', true);
  this.$cycle = this.$form.find('[name="cycle"]');

  // Only get these elements if we're showing the results on the page
  if (this.showResults) {
    this.$resultsItems = this.$elm.find('.js-results-items');
    this.$resultsTitle = this.$elm.find('.js-results-title');
  }

  this.$zip.on('change', this.handleZipChange.bind(this));
  this.$state.on('change', this.handleStateChange.bind(this));
  this.$form.on('change', 'input,select', this.search.bind(this));
  this.$form.on('submit', this.search.bind(this));
  $(window).on('popstate', this.handlePopState.bind(this));

  this.getUpcomingElections();
  this.handleStateChange();
  this.handlePopState();

  this.$map = $('.election-map');
  this.map = new ElectionLookupMap(this.$map.get(0), {
    drawStates: _.isEmpty(this.serialized),
    handleSelect: this.handleSelectMap.bind(this)
  });
};

ElectionLookup.prototype.getUpcomingElections = function() {
  // Call the API to get a list of upcoming election dates
  var now = new Date();
  var month = now.getMonth() + 1;
  var today = now.getFullYear() + '-' + month + '-' + now.getDate();
  var query = {
    'sort': 'election_date',
    'min_election_date': today
  };
  var url = helpers.buildUrl(['election-dates'], query);
  var self = this;
  if (Number(this.$cycle.val()) >= now.getFullYear()) {
    $.getJSON(url).done(function(response) {
        self.upcomingElections = response.results;
    });
  }
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

ElectionLookup.prototype.removeWrongPresidentialElections = function(results, cycle) {
  // Hack to remove the presidential result in non-presidential years
  // Eventually this will be handled by the API
  if (Number(cycle) % 4 > 0) {
    return _.filter(results, function(result) {
      return result.office !== 'P';
    });
  } else {
    return results;
  }
};

ElectionLookup.prototype.search = function(e, opts) {
  e && e.preventDefault();
  opts = _.extend({pushState: true}, opts || {});
  var self = this;
  var serialized = self.serialize();
  if (self.shouldSearch(serialized)) {
    if (!_.isEqual(serialized, self.serialized)) {
      // Requested search options differ from saved options; request new data.
      self.xhr && self.xhr.abort();
      self.xhr = $.getJSON(self.getUrl(serialized)).done(function(response) {
        self.results = self.removeWrongPresidentialElections(response.results, serialized.cycle);
        // Note: Update district color map before rendering results
        self.drawDistricts(self.results);
        self.draw(self.results);
      });
      self.serialized = serialized;
      if (opts.pushState) {
        window.history.pushState(serialized, null, URI('').query(serialized).toString());
        analytics.pageView();
      }
    } else if (self.results) {
      // Requested options match saved options; redraw cached results. This
      // ensures that clicking on a state or district will highlight it when
      // the search options don't match the state of the map, e.g. after the
      // user has run a search, then zoomed out and triggered a map redraw.
      self.drawDistricts(self.results);
    }
  }
};

ElectionLookup.prototype.handlePopState = function() {
  var params = URI.parseQuery(window.location.search);
  this.$zip.val(params.zip);
  this.$state.val(params.state);
  this.handleStateChange();
  this.$district.val(params.district);
  this.$cycle.val(params.cycle || this.$cycle.val());
  this.search(null, {pushState: false});
};

ElectionLookup.prototype.drawDistricts = function(results) {
  var encoded = _.chain(results)
    .filter(function(result) {
      return result.office === 'H';
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
  var self = this;

  if (!this.showResults) {
    if (results.length) {
      this.updateLocations();
    }
  } else {
    if (results.length) {
      this.$resultsItems.empty();
      results.forEach(function(result) {
        self.drawResult(result);
      });
      if (this.serialized.zip) {
        this.drawZipWarning();
      }
      this.updateLocations();
      this.$resultsTitle.text(this.getTitle());
    } else {
      this.$resultsTitle.text('');
      this.$resultsItems.html(noResultsTemplate(this.serialized));
    }

    if (Number(this.$cycle.val()) < window.DISTRICT_MAP_CUTOFF) {
      this.map.hide();
    } else {
      this.map.show();
    }

  }
};

ElectionLookup.prototype.drawResult = function(result) {
  var election = formatResult(result, this);
  var upcomingElections = _.filter(this.upcomingElections, function(upcoming) {
    if (election.office === 'H') {
      return upcoming.election_state === election.state &&
              upcoming.election_district === Number(election.district);
    } else if (election.office === 'S') {
      return upcoming.election_state === election.state &&
              upcoming.office_sought === election.office;
    }
  });

  if (upcomingElections.length > 0) {
    var parsed = moment(upcomingElections[0].election_date, 'YYYY-MM-DD');
    election.electionDate = parsed.isValid() ? parsed.format('MMMM Do, YYYY') : '';
    election.electionType = upcomingElections[0].election_type_full;
    this.$resultsItems.append(resultTemplate(election));
  } else {
    election.electionDate = formatGenericElectionDate(election);
    election.electionType = 'General election';
    this.$resultsItems.append(resultTemplate(election));
  }
};

ElectionLookup.prototype.drawZipWarning = function() {
  var houseResults = this.$resultsItems.find('.result[data-office="H"]');
  if (houseResults.length > 1) {
    houseResults.eq(0).before(zipWarningTemplate(this.serialized));
  }
};

/**
 * Fetch location image if not cached, then add to relevant districts
 */
ElectionLookup.prototype.updateLocations = function() {
  var self = this;
  var svg = self.$svg || $.get('/static/img/i-map--primary.svg', '', null, 'xml').then(function(document) {
    self.$svg = $(document.querySelector('svg'));
    return self.$svg;
  });

  if (this.showResults) {
    $.when(svg).done(self.drawLocations.bind(self));
  }
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
  var minYear = Number(params.cycle) - 1;
  var title = minYear + '–' + params.cycle + ' candidates';
  if (params.zip) {
    title += ' in ZIP code ' + params.zip;
  } else {
    title += ' in ' + decoders.states[params.state];
    if (params.district && params.district !== '00') {
       title += ', district ' + params.district;
    }
  }
  return title;
};

function ElectionLookupPreview(selector) {
  this.$elm = $(selector);
  this.init();
}

_.extend(ElectionLookupPreview.prototype, ElectionFormMixin);

ElectionLookupPreview.prototype.init = function() {
  this.districts = 0;

  this.$form = this.$elm.find('form');
  this.$zip = this.$form.find('[name="zip"]');
  this.$state = this.$form.find('[name="state"]');
  this.$district = this.$form.find('[name="district"]').prop('disabled', true);
  this.$cycle = this.$form.find('[name="cycle"]');

  this.$zip.on('change', this.handleZipChange.bind(this));
  this.$state.on('change', this.handleStateChange.bind(this));

  this.handleStateChange();
};

var FEATURE_TYPES = {
  STATES: 1,
  DISTRICTS: 2
};
var STATE_ZOOM_THRESHOLD = 4;

var defaultOpts = {
  colorScale: colorbrewer.Set1
};

var boundsOverrides = {
  200: {coords: [64.06, -152.23], zoom: 3}
};

function ElectionLookupMap(elm, opts) {
  this.elm = elm;
  this.opts = _.extend({}, defaultOpts, opts);
  this.statePalette = getStatePalette(this.opts.colorScale);
  this.districtPalette = getDistrictPalette(this.opts.colorScale);
  this.mapMessage = document.querySelector('.js-map-message');
  this.init();
}

ElectionLookupMap.prototype.init = function() {
  this.overlay = null;
  this.districts = null;
  this.map = L.map(this.elm, {
    scrollWheelZoom: false,
    draggable: false,
    touchZoom: false
  });
  this.map.on('viewreset', this.handleReset.bind(this));
  this.tileLayer = L.tileLayer.provider('Stamen.TonerLite');
  this.tileLayer.on('tileload', this.handleTileLoad.bind(this));
  this.tileLayer.addTo(this.map);
  if (this.opts.drawStates) {
    this.map.setView([37.8, -96], 3);
  }
};

ElectionLookupMap.prototype.drawStates = function() {
  if (this.featureType === FEATURE_TYPES.STATES) { return; }
  this.featureType = FEATURE_TYPES.STATES;
  if (this.overlay) {
    this.map.removeLayer(this.overlay);
  }
  this.districts = null;
  this.overlay = L.geoJson(stateFeatures, {
    onEachFeature: this.onEachState.bind(this)
  }).addTo(this.map);
};

ElectionLookupMap.prototype.drawDistricts = function(districts) {
  if (this.featureType === FEATURE_TYPES.DISTRICTS && !districts) { return; }
  this.featureType = FEATURE_TYPES.DISTRICTS;
  var features = districts ?
    this.filterDistricts(districts) :
    utils.districtFeatures;
  if (this.overlay) {
    this.map.removeLayer(this.overlay);
  }
  this.districts = districts;
  this.overlay = L.geoJson(features, {
    onEachFeature: this.onEachDistrict.bind(this)
  }).addTo(this.map);
  this.updateBounds(districts);
  this.drawBackgroundDistricts(districts);
};

ElectionLookupMap.prototype.updateBounds = function(districts) {
  var rule = districts && _.find(boundsOverrides, function(rule, district) {
    return districts.indexOf(parseInt(district)) !== -1;
  });
  this._viewReset = !!(rule || districts);
  if (rule) {
    this.map.setView(rule.coords, rule.zoom);
  }
  else if (districts) {
    this.map.fitBounds(this.overlay.getBounds());
  }
};

ElectionLookupMap.prototype.drawBackgroundDistricts = function(districts) {
  if (!districts) { return; }
  var states = _.chain(districts)
    .map(function(district) {
      return Math.floor(district / 100);
    })
    .unique()
    .value();
  var stateDistricts = _.filter(utils.districtFeatures.features, function(feature) {
    return states.indexOf(Math.floor(feature.id / 100)) !== -1 &&
      districts.indexOf(feature.id) === -1;
  });
  L.geoJson(stateDistricts, {
    onEachFeature: _.partial(this.onEachDistrict.bind(this), _, _, {color: '#bbbbbb'})
  }).addTo(this.overlay);
};

ElectionLookupMap.prototype.filterDistricts = function(districts) {
  return {
    type: utils.districtFeatures.type,
    features: utils.findDistricts(districts)
  };
};

ElectionLookupMap.prototype.handleStateClick = function(e) {
  if (this.opts.handleSelect) {
    var state = utils.decodeState(e.target.feature.id);
    this.opts.handleSelect(state);
  }
};

ElectionLookupMap.prototype.handleTileLoad = function(e) {
  e.tile.setAttribute('alt', 'Map tile image');
};

ElectionLookupMap.prototype.onEachState = function(feature, layer) {
  var color = this.statePalette[feature.id % this.statePalette.length];
  layer.setStyle({color: color});
  layer.on('click', this.handleStateClick.bind(this));
};

ElectionLookupMap.prototype.onEachDistrict = function(feature, layer, opts) {
  opts = opts || {};
  var decoded = utils.decodeDistrict(feature.id);
  var palette = this.districtPalette[decoded.state];
  var color = palette[decoded.district % palette.length];
  layer.setStyle({color: opts.color || color});
  layer.on('click', this.handleDistrictClick.bind(this));
};

ElectionLookupMap.prototype.handleDistrictClick = function(e) {
  this.map.removeLayer(this.overlay);
  this.drawDistricts([e.target.feature.id]);
  if (this.opts.handleSelect) {
    var district = utils.decodeDistrict(e.target.feature.id);
    this.opts.handleSelect(district.state, district.district);
  }
};

ElectionLookupMap.prototype.handleReset = function(e) {
  if (this._viewReset) {
    this._viewReset = false;
    return;
  }
  var zoom = e.target.getZoom();
  if (zoom <= STATE_ZOOM_THRESHOLD) {
    this.drawStates();
  } else if (!this.districts) {
    this.drawDistricts();
  }
};

ElectionLookupMap.prototype.hide = function() {
  this.elm.setAttribute('aria-hidden', 'true');
  this.mapMessage.setAttribute('aria-hidden', 'false');
};

ElectionLookupMap.prototype.show = function() {
  this.elm.setAttribute('aria-hidden', 'false');
  this.mapMessage.setAttribute('aria-hidden', 'true');
};

module.exports = {
  ElectionLookup: ElectionLookup,
  ElectionLookupMap: ElectionLookupMap,
  ElectionLookupPreview: ElectionLookupPreview
};
