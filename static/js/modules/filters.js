'use strict';

var events = require('./events.js');
var queryString = require('querystring');

// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
var toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var activateFilter = function() {
    var $field;

    if (this.value !== '') {
        selectedFilters[this.name] = this.value;

        $field = $('select[name=' + this.name + ']');
        addActiveStyle($field);
        $field.val(this.value).trigger("chosen:updated");
    }
};

var deactivateFilter = function() {
    delete selectedFilters[this.name];

    events.emit('deselected:filter', {
        category: $('#main').data('section'),
        filters: selectedFilters
    });

    removeActiveStyle(this);
};

var bindFilters = function(e) {
    $('#category-filters select, select[name=election_cycle]').chosen({
        width: "100%",
        allow_single_deselect: true
    });

    if (typeof e !== 'undefined' && typeof e.query !== 'undefined') {
        $('#category-filters').find('input[name=name]').val(e.query).parents('.field').addClass('active');

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
        var $nameField = $(this),
            $plusButton = $nameField.siblings('.add-filter__button');

        if ($nameField.val() === "") {
            $plusButton.addClass('disabled');
        }
        else {
            $plusButton.removeClass('disabled');
        }
    });

    // election cycle dropdown functionality
    $('select[name=election_cycle]').chosen().change(function(e, selected) {
        var $e = $(e.target),
            url = document.location.origin
                + '/'
                + $e.attr('data-type')
                + '/'
                + $e.attr('data-id')
                + '/'
                + selected.selected;

        document.location = url;
    });

    // apply name filter
    $('#category-filters').on('click', '.add-filter__button', function() {
        var $plusButton = $(this);
        if ($plusButton.hasClass('disabled') === false) {
            activateFilter.call($plusButton.prev()[0]);
        }
    });
};

var selectedFilters = {};

var addActiveStyle = function(field) {
    $(field).parent().addClass('active');
};

var removeActiveStyle = function(field) {
    $(field).parent().removeClass('active');
};

// all of the filters we use on candidates and committees
var fieldMap = [
    'name',
    'year',
    'party',
    'state',
    'district',
    'office',
    'designation',
    'organization_type'
]

var activateInitialFilters = function() {
    // this activates dropdowns
    // name filter is activated in the template
    var qs = queryString.parse(document.location.search),
        param,
        open;

    for (param in qs) {
        if (qs.hasOwnProperty(param)) {
            if (qs[param] !== "" && $.inArray(param, fieldMap) !== -1) {
                activateFilter.call({
                    // sadly the querystring module doesn't remove
                    // question marks from its parsed values
                    name: param.replace(/\?/, ''),
                    value: qs[param]
                }, false);
                open = true;
            }
        }
    }

    if (open) {
        $('#main').addClass('side--open');
    }
}

module.exports = {
    init: function() {
        // toggle filter drawer open/shut
        $('#main').on('click', '.disclosure-toggle', function() {
            $('.filter-field-container').slideToggle();
            $(this).toggleClass('disclosure-toggle--closed')
        });

        bindFilters();

        // if the page was loaded with filters set in the query string
        activateInitialFilters();
    }
};
