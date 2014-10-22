var events = require('./events.js');

var changeURL = function(context) {
    window.history.pushState('', '', '/' + context.category);
};

module.exports = {
    init: function() {
        events.on('render:browse', changeURL);
    }
};
