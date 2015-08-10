'use strict';

/* global require, module, window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');
var List = require('list.js');

var accordion = require('./accordion');

var events = require('./events.js');

// are the panels open?
var open = false;

var openFilterPanel = function() {
  $('body').addClass('panel-active--left');
  $('.side-panel--left').addClass('side-panel--open');
  $('#filter-toggle').addClass('active');
  open = true;
};

var closeFilterPanel = function() {
  $('body').removeClass('panel-active--left');
  $('.side-panel--left').removeClass('side-panel--open');
  $('#filter-toggle').removeClass('active');
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
        $parent.addClass('active');
        ensureVisible($field);
    } else {
        $field.val(prepareValue($field, '')).change();
        $parent.removeClass('active');
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
      $('body').addClass('panel-active--left');
    }
};

// Clearing the selects
$('.button--remove').click(function(e){
    e.preventDefault();
    var removes = $(this).data('removes');
    $('[name="' + removes + '"]').val('').trigger('change').focus();
    $(this).css('display', 'none');
});

$('.field input, .field select').change(function(){
    var $this = $(this);
    $('[data-removes="' + $this.attr('name') + '"]')
        .css('display', $this.val() ? 'block' : 'none');
});

// Dropdown lists
var updateSelectedItems = function(list) {
    var $this,
        $checkedBoxes;
    $this = list;
    $checkedBoxes = $this.find('input:checked').closest('li');
    $this.closest('fieldset').find('.dropdown__selected').prepend($checkedBoxes);

    // Remove it all if there's no more items to check
    if ( $this.find('li').length === 0 ) {
        $this.closest('.dropdown').remove();
    }
};

// Show "any" if there's no items checked
var countCheckboxes = function(fieldset) {
    var checkboxCount = $(fieldset).find('input:checked').length;
    if ( checkboxCount === 0 ) {
        $(fieldset).siblings('label').find('.any').attr('aria-hidden', false);
    } else {
        $(fieldset).siblings('label').find('.any').attr('aria-hidden', true);
    }
};

$('.js-checkbox-filters').each(function(){
    var $dropdownList = $(this).find('.dropdown__list');

    $dropdownList.find('input[type=checkbox]').change(function(){
        updateSelectedItems($dropdownList);
        countCheckboxes(this);
    });
});

$('.field input[type="checkbox"]').on('keypress', function(e) {
    if (e.which === 13) {
        var $this = $(this);
        var $parent = $this.closest('ul.dropdown__list');
        $this.prop('checked', function(index, value) {
            return !value;
        });
        if ($parent.length) {
            var $next = $this.closest('li').next('li').find('input[type="checkbox"]');
            if ($next.length) {
                $next.focus();
            }
        }
        $this.change();
        e.preventDefault();
    }
});

// Search-able lists
// WIP as it breaks the rest of the dropdown
// $('.dropdown__panel').each(function(){
//     var id = $(this).attr('id');
//     var options = {
//         searchClass: 'dropdown__search',
//         listClass: 'dropdown__list',
//         valueNames: ['dropdown__value']
//     };
//     var dropdownList = new List(id, options);
// })

// Scrollbars
$('.dropdown__panel').perfectScrollbar({ 'suppressScrollX': true });

$('.js-dropdown').on('click keypress', function(e) {
    if (e.which === 13 || e.type === 'click') {
        $('.dropdown__panel').perfectScrollbar('update');
    }
    e.preventDefault();
});

$('.field input[type="text"]').on('keypress', function(e) {
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
