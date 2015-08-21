'use strict';

/* global require, module, window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');
var List = require('list.js');

var events = require('fec-style/js/events');
var accordion = require('fec-style/js/accordion');

// are the panels open?
var open = false;

var openFilterPanel = function() {
  $('body').addClass('is-showing-filters');
  $('.filters').addClass('is-open');
  $('#filter-toggle').addClass('is-active')
    .find('.filters__toggle__text').html('Hide filters');
  open = true;
};

var closeFilterPanel = function() {
  $('body').removeClass('is-showing-filters');
  $('.filters.is-open').removeClass('is-open');
  $('#filter-toggle').removeClass('is-active')
    .find('.filters__toggle__text').html('Show filters');
  open = false;
};

// Keep in sync with styles/grid-settings.scss.
// TODO find better way to sync with scss.
if ($('body').width() > 500) {
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

var bindFilters = function() {
    var cycleSelect = $('.js-cycle');
    cycleSelect.each(function(){
      var $this = $(this);
      $this.change(function() {
        window.location.href = URI(window.location.href)
          .removeQuery('cycle')
          .addQuery({cycle: $this.val()})
          .toString();
      });
    });
};

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

// Clearing the selects
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
    var $minDate = $field.find('[name="min_date"]');
    var $maxDate = $field.find('[name="max_date"]');
    $field.on('change', '[type="radio"]', function(e) {
      var $input = $(e.target);
      if ($input.attr('data-min-date')) {
        $minDate.val($input.attr('data-min-date'));
        $maxDate.val($input.attr('data-max-date'));
      }
      $minDate.focus();
    });
  });
}

module.exports = {
  init: function() {
    bindFilters();
    // if the page was loaded with filters set in the query string
    activateInitialFilters();
    bindDateFilters();
  },
  getFields: getFields,
  activateInitialFilters: activateInitialFilters
};
