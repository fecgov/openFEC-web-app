var events = require('./events.js');

var changeURL = function(context) {
    var URL = '/';

    if (typeof context.category !== 'undefined') {
        URL += context.category;

        if (typeof context.query !== 'undefined') {
            URL += '?name=' + encodeURIComponent(context.query);
        }
    }

    window.history.pushState('', '', URL);
};

module.exports = {
    init: function() {
        events.on('render:browse', changeURL);
    }
};
