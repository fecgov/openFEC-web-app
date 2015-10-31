'use strict';

/* global window */

var $ = require('jquery');

// Hack: Append jQuery to `window` for use by legacy libraries
window.$ = window.jQuery = $;

var typeahead = require('fec-style/js/typeahead');
var typeaheadFilter = require('fec-style/js/typeahead-filter');

var helpers = require('./helpers');

var KEYCODE_ENTER = 13;

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

module.exports = {Filter: Filter};
