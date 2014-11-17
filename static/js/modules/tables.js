'use strict';

var events = require('./events.js');

var bindPaginationLinks = function(e) {
    $('.pagination-links a').on('click', function() {
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

module.exports = {
    init: function() {
        events.on('bind:browse', bindPaginationLinks); 

        // if loaded on a page with a results table
        bindPaginationLinks();
    }
};
