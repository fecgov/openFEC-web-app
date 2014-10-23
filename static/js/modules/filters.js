var events = require('./events.js');

var renderFilters = function(e) {
    $('#candidate-filters select').chosen({width: "100%"});
};

module.exports = {
    init: function() {
        events.on('bind:browse', renderFilters);

        // if loaded on a page with filters, init chosen
        $('#candidate-filters select').chosen({width: "100%"});
    }
};
