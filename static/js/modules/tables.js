var events = require('./events.js');

var bindPaginationLinks = function() {
    $('.pagination-links a').on('click', function() {
        event.preventDefault();
    });
};

module.exports = {
    init: function() {
        events.on('bind:browse', bindPaginationLinks); 

        // if loaded on a page with a results table
        bindPaginationLinks();
    }
};
