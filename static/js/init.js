'use strict';

var filters = require('./modules/filters.js');
var typeahead = require('./modules/typeahead.js');
var charts = require('./modules/charts.js');
var tablesort = require('tablesort');

filters.init();
typeahead.init();
charts.init();

$(document).ready(function() {
    $('body').addClass('js-initialized');

    $('.table--sortable').each(function(){
        new tablesort(this);
    });

});
