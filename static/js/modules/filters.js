var events = require('./events.js');

var renderFilters = function(e) {
    $('#candidate-filters select').chosen({width: "100%"});
};

module.exports = {
    init: function() {
        events.on('bind:browse', renderFilters);
        $('.filter-header-bar').on('click', function() {
            $('.filter-field-container').slideToggle();
        });

        // if loaded on a page with filters, init chosen
        $('#candidate-filters select').chosen({width: "100%"});
    }
};
