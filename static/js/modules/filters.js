'use strict';

/* global require, module, window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');
var List = require('list.js');

var events = require('./events.js');

// are the panels open?
var open = true;

var openFilterPanel = function() {
    $('body').addClass('panel-active--left');
    $('.side-panel--left').addClass('side-panel--open');
    $('#filter-toggle').addClass('active').html('<i class="ti-minus"></i> Hide Filters');
    open = true;
};

var closeFilterPanel = function() {
    $('body').removeClass('panel-active--left');
    $('.side-panel--left').removeClass('side-panel--open');
    $('#filter-toggle').removeClass('active').html('<i class="ti-plus"></i>Show Filters');
    open = false;
};

openFilterPanel();

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

var activateFilter = function(opts) {
    var $field = $('#category-filters [name=' + opts.name + ']');
    var $parent = $field.parent();
    if (opts.value) {
        $field.val(prepareValue($field, opts.value)).change();
        $parent.addClass('active');
    } else {
        $field.val(prepareValue($field, '')).change();
        $parent.removeClass('active');
    }
};

var bindFilters = function() {
    var cycleSelect = $('#cycle').change(function() {
        var query = {cycle: cycleSelect.val()};
        var selected = cycleSelect.find('option:selected');
        window.location.href = URI(window.location.href).query(query).toString();
    });
};


// all of the filters we use on candidates and committees
var fieldMap = [
    'q',
    'cycle',
    'party',
    'state',
    'district',
    'office',
    'designation',
    'committee_type',
    'organization_type',
    'contributor_name',
    'contributor_city',
    'contributor_state',
    'contributor_employer',
    'contributor_type',
    'min_contribution',
    'max_contribution',
    'committee_id',
    'start_date',
    'end_date'
];

var activateInitialFilters = function() {
    // this activates dropdowns
    // name filter is activated in the template
    var open;
    var qs = URI.parseQuery(window.location.search);
    _.each(fieldMap, function(key) {
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
    $('[name="' + removes + '"]').val('');
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
    $checkedBoxes = $this.find('input:checked').parents('li');
    $this.parents('fieldset').find('.dropdown__selected').prepend($checkedBoxes);

    // Remove it all if there's no more items to check
    if ( $this.find('li').length === 0 ) {
        $this.parents('.dropdown').remove();
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
        var $parent = $this.parents('ul.dropdown__list');
        $this.prop('checked', function(index, value) {
            return !value;
        });
        if ($parent.length) {
            var $next = $this.parents('li').next('li').find('input[type="checkbox"]');
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

function bindFileFilter() {
  var $field = $('#file-date');
  var $startDate = $field.find('[name="start_date"]');
  var $endDate = $field.find('[name="end_date"]');
  $field.on('click', '[name="_file_date"]', function(e) {
    var $input = $(e.target);
    if ($input.attr('data-start-date')) {
      $startDate.val($input.attr('data-start-date'));
      $endDate.val($input.attr('data-end-date'));
    }
    $startDate.focus();
  });
}

module.exports = {
    init: function() {

        bindFilters();
        // if the page was loaded with filters set in the query string
        activateInitialFilters();
        bindFileFilter();
    },
    activateInitialFilters: activateInitialFilters
};
