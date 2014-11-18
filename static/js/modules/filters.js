'use strict';

var events = require('./events.js');

// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
var toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var activateFilter = function() {
    disableForm();

    selectedFilters[this.name] = this.value;

    events.emit('selected:filter', {
        field: this.name,
        value: this.value,
        category: $('#main').data('section'),
        filters: selectedFilters
    });

    addActiveStyle(this);
};

var deactivateFilter = function() {
    disableForm();

    delete selectedFilters[this.name];

    events.emit('deselected:filter', {
        category: $('#main').data('section'),
        filters: selectedFilters
    });

    removeActiveStyle(this);
};

var disableForm = function() {
    $('#category-filters input').attr('disabled', '');
    $('#category-filters select').attr('disabled', '').trigger("chosen:updated");
};

var enableForm = function() {
    $('#category-filters input').removeAttr('disabled');
    $('#category-filters select').removeAttr('disabled').trigger("chosen:updated");
};

var bindFilters = function(e) {
    $('#category-filters select').chosen({
        width: "100%",
        allow_single_deselect: true
    });

    if (typeof e !== 'undefined' && typeof e.query !== 'undefined') {
        $('#category-filters').find('input[name=name]').val(e.query).parent().addClass('active');

        selectedFilters['name'] = e.query;
    }

    // make select boxes work
    $('#category-filters select').chosen().change(function(e, selected) {
        // if there is no selected object, the user deselected the field
        if (typeof selected === 'undefined') {
            deactivateFilter.call(this);
        }
        else {
            activateFilter.call(this);
        }
    });

    // make name filter work
    $('#category-filters input').on('input', function() {
        if ($('.add-filter').length === 0) {
            $(this).parent().append('<a class="add-filter">+</a>');
        }
    });

    // apply name filter
    $('#category-filters').on('click', '.add-filter', function() {
        activateFilter.call($(this).prev()[0]);
    });
};

var selectedFilters = {};

var addActiveStyle = function(field) {
    $(field).parent().addClass('active');
};

var removeActiveStyle = function(field) {
    $(field).parent().removeClass('active');
};

module.exports = {
    init: function() {
        events.on('bind:filters', bindFilters);
        events.on('render:browse', enableForm);
        events.on('render:searchResults', enableForm);

        // toggle filter drawer open/shut
        $('#main').on('click', '.filter-header-bar', function() {
            $('.filter-field-container').slideToggle();
        });

        // if loaded on a page with filters, init chosen
        bindFilters();
    }
};
