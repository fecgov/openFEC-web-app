var events = require('./events.js');

var categoryLinkHandler = function() {
                e.category = 'candidates';
                events.emit('render:filters', e);
                events.emit('render:browse', e);

};

module.exports = {
    init: function() {
        $('#search').on('submit', function(e) {
            e.preventDefault();
            var searchQuery = $(e.target).find('input[name=search]').val();

            // update main with section
            $('#main').data('section', 'candidates');

            events.emit('search:submitted', {'query': searchQuery});
        });
    }
};
