'use strict';

var events = require('./events.js');

var buildURL = function(context) {
    var URL = '/',
        field;

    if (typeof context.category !== 'undefined') {
        URL += context.category + '?';

        if (typeof context.query !== 'undefined') {
            URL += 'q=' + encodeURIComponent(context.query) + '&';
        }

        if (typeof context.filters !== 'undefined') {
            for (field in context.filters) {
                if (context.filters.hasOwnProperty(field)) {
                    URL += field + '=' + context.filters[field] + '&'
                }
            }
        }
    }

    return URL;
};

var changeURL = function(context) {
    var URL = buildURL(context);

    if (URL !== window.location.pathname) {
        window.history.pushState('', '', URL);
    }
};

module.exports = {
    init: function() {
        events.on('load:browse', changeURL);
        events.on('render:browse', changeURL);
        events.on('selected:filter', changeURL);
        events.on('removed:filter', changeURL);
        events.on('render:searchResultsList', changeURL);
        events.on('render:searchResults', changeURL);
    },

    // for unit tests
    buildURL: buildURL
};
