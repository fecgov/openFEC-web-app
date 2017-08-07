'use strict';

/* global window */

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');
var moment = require('moment');

var analytics = require('fec-style/js/analytics');

var ElectionForm = require('./election-form').ElectionForm;
var ElectionMap = require('./election-map').ElectionMap;
var helpers = require('./helpers');
var decoders = require('./decoders');

var resultTemplate = require('../../templates/electionResult.hbs');
var zipWarningTemplate = require('../../templates/electionZipWarning.hbs');
var noResultsTemplate = require('../../templates/electionNoResults.hbs');

var officeMap = {
  P: 'President',
  S: 'Senate',
  H: 'House'
};

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

/* ElectionSearch */
function ElectionSearch(selector) {
  this.$elm = $(selector);
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

  this.$resultsItems = this.$elm.find('.js-results-items');
  this.$resultsTitle = this.$elm.find('.js-results-title');

  this.$map = $('.election-map');
  this.map = new ElectionMap(this.$map.get(0), {
    drawStates: _.isEmpty(this.serialized),
    handleSelect: this.handleSelectMap.bind(this)
  });

  this.$zip.on('change', this.handleZipChange.bind(this));
  this.$state.on('change', this.handleStateChange.bind(this));
  this.$form.on('change', 'input,select', this.search.bind(this));
  this.$form.on('submit', this.search.bind(this));
  $(window).on('popstate', this.handlePopState.bind(this));

  this.getUpcomingElections();
  this.handleStateChange();
  this.handlePopState();  
}

ElectionSearch.prototype = Object.create(ElectionForm.prototype);
ElectionSearch.constructor = ElectionSearch;

ElectionSearch.prototype.getUpcomingElections = function() {
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

ElectionSearch.prototype.handleSelectMap = function(state, district) {
  this.$zip.val('');
  this.$state.val(state);
  this.updateDistricts(state);
  if (district && this.hasOption(this.$district, district)) {
    this.$district.val(district);
  }
  this.search();
};

ElectionSearch.prototype.removeWrongPresidentialElections = function(results, cycle) {
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

ElectionSearch.prototype.search = function(e, opts) {
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
        var encodedDistricts = self.encodeDistricts(self.results);
        self.map.drawDistricts(encodedDistricts);
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
      var encodedDistricts = self.encodeDistricts(self.results);
      self.map.drawDistricts(encodedDistricts);
    }
  }
};

ElectionSearch.prototype.handlePopState = function() {
  var params = URI.parseQuery(window.location.search);
  this.$zip.val(params.zip);
  this.$state.val(params.state);
  this.handleStateChange();
  this.$district.val(params.district);
  this.$cycle.val(params.cycle || this.$cycle.val());
  this.search(null, {pushState: false});
};

ElectionSearch.prototype.shouldSearch = function(serialized) {
  return serialized.zip || serialized.state;
};

ElectionSearch.prototype.draw = function(results) {
  var self = this;
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
};

ElectionSearch.prototype.drawResult = function(result) {
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

ElectionSearch.prototype.drawZipWarning = function() {
  var houseResults = this.$resultsItems.find('.result[data-office="H"]');
  if (houseResults.length > 1) {
    houseResults.eq(0).before(zipWarningTemplate(this.serialized));
  }
};

/**
 * Fetch location image if not cached, then add to relevant districts
 */
ElectionSearch.prototype.updateLocations = function() {
  var self = this;
  var svg = self.$svg || $.get('/static/img/i-map--primary.svg', '', null, 'xml')
    .then(function(document) {
      self.$svg = $(document.querySelector('svg'));
      return self.$svg;
    });

  $.when(svg).done(self.drawLocations.bind(self));
};

/**
 * Append highlighted location images to relevant districts
 * @param {jQuery} $svg - SVG element
 */
ElectionSearch.prototype.drawLocations = function($svg) {
  this.$resultsItems.find('[data-color]').each(function(_, elm) {
    var $elm = $(elm);
    var $clone = $svg.clone();
    $clone.find('path').css('fill', $elm.data('color'));
    $elm.prepend($clone);
  });
};

ElectionSearch.prototype.getTitle = function() {
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

module.exports = {
  ElectionSearch: ElectionSearch
};
