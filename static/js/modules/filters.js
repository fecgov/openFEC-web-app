'use strict';

/* global window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

// Hack: Append jQuery to `window` for use by legacy libraries
window.$ = window.jQuery = $;

var typeahead = require('fec-style/js/typeahead');
var typeaheadFilter = require('fec-style/js/typeahead-filter');
var accessibility = require('fec-style/js/accessibility');

var helpers = require('./helpers');

var KEYCODE_ENTER = 13;

var defaultOptions = {
  body: '.filters',
  form: '#category-filters',
  toggle: '#filter-toggle'
};

function FilterPanel(options) {
  this.isOpen = false;
  this.options = _.extend({}, defaultOptions, options);

  this.$body = $(this.options.body);
  this.$form = $(this.options.form);
  this.$toggle = $(this.options.toggle);

  this.$toggle.on('click', this.toggle.bind(this));

  this.filterSet = new FilterSet(this.$form).activate();
  if (!_.isEmpty(this.filterSet.serialize())) {
    this.show();
  }

  this.adjust();
}

FilterPanel.prototype.adjust = function() {
  if ($('body').width() > 768) {
    this.show();
  } else if (!this.isOpen) {
    this.hide();
  }
};

FilterPanel.prototype.show = function() {
  this.$body.addClass('is-open');
  this.$toggle.addClass('is-active');
  this.$toggle.find('.filters__toggle__text').html('Hide filters');
  accessibility.restoreTabindex(this.$form);
  $('body').addClass('is-showing-filters');
  this.isOpen = true;
};

FilterPanel.prototype.hide = function() {
  this.$body.removeClass('is-open');
  this.$toggle.removeClass('is-active');
  this.$toggle.find('.filters__toggle__text').html('Show filters');
  $('#results tr:first-child').focus();
  accessibility.removeTabindex(this.$form);
  $('body').removeClass('is-showing-filters');
  this.isOpen = false;
};

FilterPanel.prototype.toggle = function() {
  if (this.isOpen) {
    this.hide();
  } else {
    this.show();
  }
};

function FilterSet(elm) {
  this.$elm = $(elm);
  this.$clear = this.$elm.find('.js-clear-filters');

  this.$clear.on('click keypress', this.handleClear.bind(this));

  this.filters = {};
  this.fields = [];
}

FilterSet.prototype.activate = function() {
  var query = URI.parseQuery(window.location.search);
  this.filters = _.chain(this.$elm.find('.filter'))
    .map(function(elm) {
      var filter = Filter.build($(elm)).fromQuery(query);
      return [filter.name, filter];
    })
    .object()
    .value();
  this.fields = _.chain(this.filters)
    .pluck('fields')
    .flatten()
    .value();
  return this;
};

FilterSet.prototype.serialize = function() {
  return _.reduce(this.$elm.serializeArray(), function(memo, val) {
    if (val.value && val.name.slice(0, 1) !== '_') {
      if (memo[val.name]) {
        memo[val.name].push(val.value);
      } else{
        memo[val.name] = [val.value];
      }
    }
    return memo;
  }, {});
};

FilterSet.prototype.handleClear = function(e) {
  if (e.which === KEYCODE_ENTER || e.type === 'click') {
    this.clear();
    $(e.target).focus();
  }
};

FilterSet.prototype.clear = function() {
  _.each(this.filters, function(filter) {
    filter.setValue();
  });
};

function prepareValue($elm, value) {
  return $elm.attr('type') === 'checkbox' ?
    helpers.ensureArray(value) :
    value;
}

function Filter(elm) {
  this.$elm = $(elm);
  this.$input = this.$elm.find('input[name]');
  this.$remove = this.$elm.find('.button--remove');

  this.$input.on('change', this.handleChange.bind(this));
  this.$remove.on('click', this.handleClear.bind(this));

  this.name = this.$input.eq(0).attr('name');
  this.fields = [this.name];
}

Filter.build = function($elm) {
  if ($elm.hasClass('date-choice-field')) {
    return new DateFilter($elm);
  } else if ($elm.hasClass('js-typeahead-filter')) {
    return new TypeaheadFilter($elm);
  } else {
    return new Filter($elm);
  }
};

Filter.prototype.fromQuery = function(query) {
  this.setValue(query[this.name]);
  return this;
};

Filter.prototype.setValue = function(value) {
  var $input = this.$input.data('temp') ?
    this.$elm.find('#' + this.$input.data('temp')) :
    this.$input;
  $input.val(prepareValue($input, value)).change();
  return this;
};

Filter.prototype.handleClear = function() {
  this.setValue();
  this.$input.focus();
};

Filter.prototype.handleKeydown = function(e) {
  if (e.which === KEYCODE_ENTER) {
    e.preventDefault();
    this.$input.change();
  }
};

Filter.prototype.handleChange = function() {
  this.$remove.css('display', this.$input.val() ? 'block' : 'none');
};

function DateFilter(elm) {
  Filter.call(this, elm);

  this.$minDate = this.$elm.find('.js-min-date');
  this.$maxDate = this.$elm.find('.js-max-date');
  this.$elm.on('change', this.handleRadioChange.bind(this));

  this.fields = ['min_' + this.name, 'max_' + this.name];
}

DateFilter.prototype = Object.create(Filter.prototype);
DateFilter.constructor = DateFilter;

DateFilter.prototype.handleRadioChange = function(e) {
  var $input = $(e.target);
  if (!$input.is(':checked')) { return; }
  if ($input.attr('data-min-date')) {
    this.$minDate.val($input.data('min-date'));
    this.$maxDate.val($input.data('max-date'));
  }
  this.$minDate.focus();
};

DateFilter.prototype.fromQuery = function(query) {
  this.setValue([
    query['min_' + this.name],
    query['max_' + this.name]
  ]);
  return this;
};

DateFilter.prototype.setValue = function(value) {
  value = helpers.ensureArray(value);
  this.$minDate.val(value[0]);
  this.$maxDate.val(value[1]);
};

function TypeaheadFilter(elm) {
  Filter.call(this, elm);

  var key = this.$elm.data('dataset');
  var dataset = typeahead.datasets[key];
  this.typeaheadFilter = new typeaheadFilter.TypeaheadFilter(this.$elm, dataset);
}

TypeaheadFilter.prototype = Object.create(Filter.prototype);
TypeaheadFilter.constructor = TypeaheadFilter;

function CycleSelect(elm) {
  this.$elm = $(elm);
  this.$elm.on('change', this.handleChange.bind(this));
}

CycleSelect.build = function($elm) {
  switch ($elm.data('cycle-location')) {
  case 'query':
    return new QueryCycleSelect($elm);
  case 'path':
    return new PathCycleSelect($elm);
  }
};

CycleSelect.prototype.handleChange = function() {
  this.setUrl(this.nextUrl(this.$elm.val()));
};

CycleSelect.prototype.setUrl = function(url) {
  window.location.href = url;
};

function QueryCycleSelect() {
  CycleSelect.apply(this, _.toArray(arguments));
}

QueryCycleSelect.prototype = Object.create(CycleSelect.prototype);

QueryCycleSelect.prototype.nextUrl = function(cycle) {
  return URI(window.location.href)
    .removeQuery('cycle')
    .addQuery({cycle: cycle})
    .toString();
};

function PathCycleSelect() {
  CycleSelect.apply(this, _.toArray(arguments));
}

PathCycleSelect.prototype = Object.create(CycleSelect.prototype);

PathCycleSelect.prototype.nextUrl = function(cycle) {
  var uri = URI(window.location.href);
  var path = uri.path()
    .replace(/^\/|\/$/g, '')
    .split('/')
    .slice(0, -1)
    .concat([cycle])
    .join('/')
    .concat('/');
  return uri.path(path).toString();
};

module.exports = {
  CycleSelect: CycleSelect,
  QueryCycleSelect: QueryCycleSelect,
  PathCycleSelect: PathCycleSelect,
  FilterPanel: FilterPanel,
  FilterSet: FilterSet,
  Filter: Filter
};
