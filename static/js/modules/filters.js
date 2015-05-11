'use strict';

/* global require, module, window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

var events = require('./events.js');

// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
var toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

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

var activateFilter = function(opts) {
    var $field = $('select[name=' + opts.name + ']');
    if (opts.value) {
        $field.val(opts.value);
        $field.parent().addClass('active');
        selectedFilters[opts.name] = opts.value;
    }
};

var bindFilters = function(e) {

    if (typeof e !== 'undefined' && typeof e.query !== 'undefined') {
        $('#category-filters').find('input[name=name]').val(e.query).parents('.field').addClass('active');

        selectedFilters.name = e.query;
    }

    // election cycle dropdown functionality
    $('select[name=election_cycle]').change(function() {
        var $this = $(this);
        var url = [
            '',
            $this.attr('data-type'),
            $this.attr('data-id'),
            $this.val()
        ].join('/');
        window.location = url;
    });
};

var selectedFilters = {};

// all of the filters we use on candidates and committees
var fieldMap = [
    'name',
    'cycle',
    'party',
    'state',
    'district',
    'office',
    'designation',
    'organization_type'
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

$('.field select').change(function(){
    var name = $(this).attr('name');
    if ( $(this).val() !== '' ) {
        $('[data-removes="' + name + '"]').css('display', 'block');
    } else {
        $('[data-removes="' + name + '"]').css('display', 'none');
    }
});

module.exports = {
    init: function() {

        bindFilters();

        // if the page was loaded with filters set in the query string
        activateInitialFilters();
    }
};
