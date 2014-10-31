var events = require('./events.js');

var changeURL = function(context) {
    var URL = '/';

    if (typeof context.category !== 'undefined') {
        URL += context.category;

        if (typeof context.query !== 'undefined') {
            URL += '?name=' + encodeURIComponent(context.query);
        }
        else if (typeof context.filters !== 'undefined') {
            URL += '?';
            for (field in context.filters) {
                if (context.filters.hasOwnProperty(field)) {
                    URL += field + '=' + context.filters[field] + '&'
                }
            }
        }
    }

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
    }
};
