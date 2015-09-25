'use strict';

/* global require, module, window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

var events = require('fec-style/js/events');
var accordion = require('fec-style/js/accordion');
var accessibility = require('fec-style/js/accessibility');

// are the panels open?
var open = false;

var openFilterPanel = function() {
  $('body').addClass('is-showing-filters');
  $('.filters').addClass('is-open').attr('tabindex','0');
  $('#filter-toggle').addClass('is-active')
    .find('.filters__toggle__text').html('Hide filters');
  accessibility.restoreTabindex($('#category-filters'));
  open = true;
};

var closeFilterPanel = function() {
  $('body').removeClass('is-showing-filters');
  $('.filters.is-open').removeClass('is-open');
  $('#filter-toggle').removeClass('is-active')
    .find('.filters__toggle__text').html('Show filters');
  $('#results tr:first-child').focus();
  accessibility.removeTabindex($('#category-filters'));
  open = false;
};

// Keep in sync with styles/grid-settings.scss.
// TODO find better way to sync with scss.
if ($('body').width() > 768) {
  open = true;
  openFilterPanel();
}

$('#filter-toggle').click(function(){
  if ( open === true ) {
    closeFilterPanel();
  } else {
    openFilterPanel();
  }
});

var prepareValue = function($elm, value) {
  if ($elm.attr('type') === 'checkbox') {
    return $.isArray(value) ? value : [value];
  } else {
    return value;
  }
  return $elm.attr('type') === 'checkbox' ? [value] : value;
};

function ensureVisible($elm) {
  if ($elm.is(':visible')) {
    return;
  }
  var $accordion = $elm.closest('.js-accordion');
  if ($accordion.length) {
    accordion.showHeader($accordion.find('.js-accordion_header'));
  }
}

var activateFilter = function(opts) {
    var $field = $('#category-filters [name=' + opts.name + ']');
    if ($field.data('temp')) {
      $field = $('#' + $field.data('temp'));
    }
    var $parent = $field.parent();
    if (opts.value) {
        $field.val(prepareValue($field, opts.value)).change();
        $parent.addClass('is-active');
        ensureVisible($field);
    } else {
        $field.val(prepareValue($field, '')).change();
        $parent.removeClass('is-active');
    }
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

function getFields() {
  return _.chain($('div#filters :input[name]'))
    .map(function(input) {
      return $(input).attr('name');
    })
    .filter(function(name) {
      return name && name.slice(0, 1) !== '_';
    })
    .uniq()
    .value();
}

var activateInitialFilters = function() {
    // this activates dropdowns
    // name filter is activated in the template
    var open;
    var qs = URI.parseQuery(window.location.search);
    var fields = getFields();
    _.each(fields, function(key) {
      activateFilter({
        name: key,
        value: qs[key]
      });
      open = open || qs[key];
    });

    if (open) {
      $('body').addClass('is-showing-filters');
    }
};

var clearFilters = function() {
  var fields = getFields();
  _.each(fields, function(key) {
    activateFilter({
      name: key,
      value: null
    })
  });
};

// Clearing the filters
$('.js-clear-filters').on('click keypress', function(e){
  if (e.which === 13 || e.type === 'click') {
    clearFilters();
    $(this).focus();
  }
})

$('.button--remove').click(function(e){
    e.preventDefault();
    var removes = $(this).data('removes');
    $('[name="' + removes + '"]').val('').trigger('change').focus();
    $(this).css('display', 'none');
});

$('.filter input, .filter select').change(function(){
    var $this = $(this);
    $('[data-removes="' + $this.attr('name') + '"]')
        .css('display', $this.val() ? 'block' : 'none');
});

$('.filter input[type="text"]').on('keypress', function(e) {
    if (e.which === 13) {
        $(this).change();
        e.preventDefault();
    }
});

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
    // if the page was loaded with filters set in the query string
    activateInitialFilters();
    bindDateFilters();
  },
  getFields: getFields,
  activateInitialFilters: activateInitialFilters
};
