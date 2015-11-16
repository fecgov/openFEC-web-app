'use strict';

/* global window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

var cyclesTemplate = require('../../templates/electionCycles.hbs');

function CycleSelect(elm) {
  this.$elm = $(elm);
  this.duration = this.$elm.data('duration');

  this.$elm.on('change', this.handleChange.bind(this));

  this.initCycles();
}

CycleSelect.prototype.initCycles = function() {
  if (this.duration <= 2) { return; }
  this.$cycles = $('<div></div>');
  this.$cycles.insertAfter(this.$elm);
  var selected = parseInt(this.$elm.val());
  var cycles = _.range(selected, selected - this.duration, -2);
  var bins = _.map(cycles, function(cycle) {
    return {min: cycle - 1, max: cycle, period: false};
  });
  bins.unshift({min: selected - this.duration + 1, max: selected, period: true});
  this.$cycles.html(cyclesTemplate(bins));
  var query = URI.parseQuery(window.location.search);
  this.$cycles.find('[value="' + query.cycle + '"][data-period="' + query.period + '"]')
    .prop('selected', true);
  this.$cycles.on('change', this.handleChange.bind(this));
};

CycleSelect.build = function($elm) {
  var location = $elm.data('cycle-location');
  if (location === 'query') {
    return new QueryCycleSelect($elm);
  } else if (location === 'path') {
    return new PathCycleSelect($elm);
  }
};

CycleSelect.prototype.handleChange = function(e) {
  var $target = $(e.target);
  var cycle = $target.val();
  var period = $target.find(':selected').data('period');
  period = period !== undefined ? period : true;
  this.setUrl(this.nextUrl(cycle, period));
};

CycleSelect.prototype.setUrl = function(url) {
  window.location.href = url;
};

function QueryCycleSelect() {
  CycleSelect.apply(this, _.toArray(arguments));
}

QueryCycleSelect.prototype = Object.create(CycleSelect.prototype);

QueryCycleSelect.prototype.nextUrl = function(cycle, period) {
  return URI(window.location.href)
    .removeQuery('cycle')
    .removeQuery('period')
    .addQuery({
      cycle: cycle,
      period: period
    })
    .toString();
};

function PathCycleSelect() {
  CycleSelect.apply(this, _.toArray(arguments));
}

PathCycleSelect.prototype = Object.create(CycleSelect.prototype);

PathCycleSelect.prototype.nextUrl = function(cycle, period) {
  var uri = URI(window.location.href);
  var path = uri.path()
    .replace(/^\/|\/$/g, '')
    .split('/')
    .slice(0, -1)
    .concat([cycle])
    .join('/')
    .concat('/');
  return uri.path(path)
    .search({period: period})
    .toString();
};

module.exports = {CycleSelect: CycleSelect};
