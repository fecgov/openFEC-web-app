var events = require('./events.js');

var changeURL = function(context) {
    var URL = '/';

    if (typeof context.category !== 'undefined') {
        URL += context.category;

        if (typeof context.query !== 'undefined') {
            URL += '?name=' + encodeURIComponent(context.query);
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
    }
};
