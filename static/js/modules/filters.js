var events = require('./events.js');

var renderFilters = function(e) {
    $('#candidate-filters select').chosen({width: "100%"});
};

module.exports = {
    init: function() {
        var $selects = $('#candidate-filters select');
        events.on('bind:browse', renderFilters);
        $('.filter-header-bar').on('click', function() {
            $('.filter-field-container').slideToggle();
        });

        // if loaded on a page with filters, init chosen
        $selects.chosen({width: "100%"});

        $selects.chosen().change(function() {
            events.emit('selected:filter', {
                field: this.name,
                value: this.value,
                category: $('#main').data('section')
            });
        });
    }
};
