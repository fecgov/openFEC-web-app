var events = require('./events.js');

module.exports = {
    init: function() {
        $('#search').on('submit', function(e) {
            e.preventDefault();
            var searchQuery = $(e.target).find('input[name=search]').val();

            events.emit('search:submitted', {'query': searchQuery});
        });

        events.on('bind:search', function() {
            $('.filter-records').on('click', function() {
                event.preventDefault();

                var context = {},
                    $target = $(event.target);

                context.category = $target.data('category');
                context.query = $target.data('query');

                $('#main').data('section', context.category);

                events.emit('render:filters', context);
                events.emit('load:browse', context);
            });
        });
    }
};
