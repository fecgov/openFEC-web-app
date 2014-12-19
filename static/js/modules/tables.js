'use strict';

var events = require('./events.js');
var tablesort = require('tablesort');

var bindPaginationLinks = function(e) {
    $('.pagination a').on('click', function() {
        event.preventDefault();

        // gets the relative path vs. the full url like this.href
        var pathArr = $(this).attr('href').split('?'),
            queryStrArr = pathArr[1].split('&'),
            context = {},
            filterArr,
            i,
            len = queryStrArr.length;

        context.category = pathArr[0].match(/[a-z]+/)[0];
        context.filters = {};

        for (i = 0; i < len; i++) {
            if (queryStrArr[i] !== "") {
                filterArr = queryStrArr[i].split('=');
                context.filters[filterArr[0]] = filterArr[1];
            }
        }

        events.emit('nav:pagination', context);
    });
};

// Implementing tablesort
var sortTable = function(e){
  $('.table--sortable').each(function(){
    new tablesort(this);
  });
}

var singleClickHandler = function(e) {
  e.preventDefault();
  var id = $(this).data('id');
  var category = $(this).data('category');

  events.emit('load:singleEntity', {
    category: category + 's',
    id: id
  });
}

module.exports = {
    init: function() {
        events.on('bind:browse', bindPaginationLinks);
        events.on('bind:browse', sortTable);
        $('#main').on('click', '.single-link', singleClickHandler);

        // if loaded on a page with a results table
        bindPaginationLinks();


    }
};
