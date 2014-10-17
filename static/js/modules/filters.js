var events = require('./events.js');

var renderFilters = function(e) {

};

module.exports = {
    init: function() {
        events.on('render:browse', renderFilters);
    }
};
