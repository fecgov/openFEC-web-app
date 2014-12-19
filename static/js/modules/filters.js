'use strict';

var events = require('./events.js');
var queryString = require('querystring');

// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
var toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var activateFilter = function(resultsLoaded) {
    var $field;

    // if triggered from DOM event
    if (typeof resultsLoaded === 'undefined') {
        disableForm();
        events.emit('selected:filter', {
            field: this.name,
            value: this.value,
            category: $('#main').data('section'),
            filters: selectedFilters
        });

        addActiveStyle(this);
    }
    // if triggered by page load with filters in query string
    else {
        $field = $('select[name=' + this.name + ']');
        addActiveStyle($field);
        $field.val(this.value).trigger("chosen:updated");
    }

    selectedFilters[this.name] = this.value;
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
        var $nameField = $(this),
            $plusButton = $nameField.siblings('.add-filter__button');

        if ($nameField.val() === "") {
            $plusButton.addClass('disabled');
        }
        else {
            $plusButton.removeClass('disabled');
        }
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

var activateInitialFilters = function() {
    var qs = queryString.parse(document.location.search),
        param;

    for (param in qs) {
        if (qs.hasOwnProperty(param)) {
            if (param !== "") {
                activateFilter.call({
                    name: param.replace(/\?/, ''),
                    value: qs[param]
                }, false);
            }
        }
    }
    
}

module.exports = {
    init: function() {
        events.on('bind:filters', bindFilters);
        events.on('render:browse', enableForm);
        events.on('render:searchResults', enableForm);

        // toggle filter drawer open/shut
        $('#main').on('click', '.disclosure-toggle', function() {
            $('.filter-field-container').slideToggle();
            $(this).toggleClass('disclosure-toggle--closed')
        });

        // if loaded on a page with filters, init chosen
        bindFilters();

        // if the page was loaded with filters set in the query string
        activateInitialFilters();
    }
};
