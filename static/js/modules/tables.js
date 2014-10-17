var events = require('./events.js');

var renderTable = function(e) {
    console.log(e.category);
};

module.exports = {
    init: function() {
        events.on('render:browse', renderTable);
    }
};
