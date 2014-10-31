var events = require('./events.js');

var bindFilters = function(e) {
    $('#candidate-filters select').chosen({width: "100%"});
};

var selectedFilters = {};

var addBox = function(e) {
   $('#selected-filters').append('<div class="selected-filter" data-field="' + e.name + '">' + e.name + ': ' + e.value + '<a class="close" href="">x</a></div>'); 
};

module.exports = {
    init: function() {
        var $selects = $('#candidate-filters select');
        events.on('bind:filters', bindFilters);
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

            selectedFilters[this.name] = this.value;
            addBox(this);
        });

        $('#selected-filters').on('click', '.close', function(e) {
            e.preventDefault();

            var $box = $(event.target).parent();
            delete selectedFilters[$box.data('field')];
            $box.remove();
        });
    }
};
