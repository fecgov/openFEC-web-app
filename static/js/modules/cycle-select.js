'use strict';

/* global window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('urijs');

var cycleTemplate = require('../../templates/electionCycle.hbs');
var cyclesTemplate = require('../../templates/electionCycles.hbs');

function CycleSelect(elm) {
  this.$elm = $(elm);
  this.duration = this.$elm.data('duration');

  this.$elm.on('change', this.handleChange.bind(this));

  this.initCycles();
}

CycleSelect.prototype.initCycles = function() {
  this.$cycles = $('<div class="subcycle-select"></div>');
  this.$cycles.insertAfter(this.$elm.closest('.cycle-select'));
  var selected = parseInt(this.$elm.val());
  if (this.duration > 2) {
    this.initCyclesMulti(selected);
  } else {
    this.initCyclesSingle(selected);
  }
};

CycleSelect.prototype.initCyclesMulti = function(selected) {
  var cycles = _.range(selected, selected - this.duration, -2);
  var params = this.getParams();
  var bins = _.map(cycles, function(cycle) {
    return {
      min: cycle - 1,
      max: cycle,
      period: false,
      checked: cycle.toString() === params.cycle &&
        params.period === 'false'
    };
  });
  bins.unshift({
    min: selected - this.duration + 1,
    max: selected,
    period: true,
    checked: true
  });
  this.$cycles.html(cyclesTemplate(bins));
  this.$cycles.on('change', this.handleChange.bind(this));
};

CycleSelect.prototype.initCyclesSingle = function(selected) {
  this.$cycles.html(cycleTemplate({min: selected - 1, max: selected}));
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
  var period = $target.data('period');
  if (period === undefined && this.duration > 2) {
    period = 'true';
  }
  this.setUrl(this.nextUrl(cycle, period));
};

CycleSelect.prototype.setUrl = function(url) {
  window.location.href = url;
};

function QueryCycleSelect() {
  CycleSelect.apply(this, _.toArray(arguments));
}

QueryCycleSelect.prototype = Object.create(CycleSelect.prototype);

QueryCycleSelect.prototype.getParams = function() {
  var query = URI.parseQuery(window.location.search);
  return {
    cycle: query.cycle,
    period: query.period
  };
};

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

PathCycleSelect.prototype.getParams = function() {
  var query = URI.parseQuery(window.location.search);
  var cycle = window.location.pathname
    .replace(/\/$/, '')
    .split('/')
    .pop();
  return {
    cycle: cycle,
    period: query.period
  };
};

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
