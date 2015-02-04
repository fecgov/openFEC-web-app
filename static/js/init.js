'use strict';

var filters = require('./modules/filters.js');
var typeahead = require('./modules/typeahead.js');
var tablesort = require('tablesort');

filters.init();
typeahead.init();

$(document).ready(function() {
    $('body').addClass('js-initialized');

    $('.table--sortable').each(function(){
        new tablesort(this);
    });

    $('.side-toggle').click(function(){
    	$('.results-content').toggleClass('filters--open');
    })
});
