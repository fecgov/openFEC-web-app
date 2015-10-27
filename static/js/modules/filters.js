'use strict';

/* global window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

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

  this.fields = {};
}

FilterSet.prototype.activate = function() {
  var query = URI.parseQuery(window.location.search);
  this.fields = _.chain(this.$elm.find('.filter'))
    .map(function(elm) {
      var filter = new Filter(elm);
      filter.setValue(query[filter.name]);
      return [filter.name, filter];
    })
    .object()
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
  _.each(this.fields, function(field) {
    field.setValue();
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
}

Filter.prototype.setValue = function(value) {
  var $input = this.$input.data('temp') ?
    this.$elm.find('#' + this.$input.data('temp')) :
    this.$input;
  $input.val(prepareValue($input, value)).change();
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

function initCycleFilters() {
  var cycleSelect = $('.js-cycle');
  var callbacks = {
    path: addCyclePath,
    query: addCycleQuery
  };
  cycleSelect.each(function(_, elm) {
    var $elm = $(elm);
    var callback = callbacks[$elm.data('cycle-location')];
    if (callback) {
      $elm.change(function() {
        window.location.href = callback($elm.val());
      });
    }
  });
}

function addCycleQuery(cycle) {
  return URI(window.location.href)
    .removeQuery('cycle')
    .addQuery({cycle: cycle})
    .toString();
}

function addCyclePath(cycle) {
  var uri = URI(window.location.href);
  var path = uri.path()
    .replace(/^\/|\/$/g, '')
    .split('/')
    .slice(0, -1)
    .concat([cycle])
    .join('/')
    .concat('/');
  return uri.path(path).toString();
}

/**
 * Initialize date picker filters
 */
function bindDateFilters() {
  $('.date-choice-field').each(function(_, field) {
    var $field = $(field);
    var $minDate = $field.find('.js-min-date');
    var $maxDate = $field.find('.js-max-date');
    $field.on('change', '[type="radio"]', function(e) {
      var $input = $(e.target);
      if ($input.attr('data-min-date')) {
        $minDate.val($input.data('min-date'));
        $maxDate.val($input.data('max-date'));
      }
      $minDate.focus();
    });
  });
}

module.exports = {
  init: function() {
    initCycleFilters();
    bindDateFilters();
  },
  FilterPanel: FilterPanel
};
