module.exports = {
    init: function() {
        $('#search').on('submit', function(e) {
            e.preventDefault();
            var events = require('./events.js');
            var searchQuery = $(e.target).find('input[name=search]').val();

            // update main with section
            $('#main').data('section', 'candidates');

            events.emit('search:submitted', {'query': searchQuery});
        });
    }
};
