var events = require('./events.js');
var router = require('page');

var changeURL = function(context) {
    router('/' + context.category);
};

module.exports = {
    init: function() {
        events.on('render:browse', changeURL);
    }
};
