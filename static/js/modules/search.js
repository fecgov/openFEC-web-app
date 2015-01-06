'use strict';

var events = require('./events.js');

var enableSearchForm = function() {
    var $form = $('form#search'),
        $submitButton = $form.find('input[type=submit]'),
        $searchBox = $form.find('input[name=search]');

    $submitButton.removeAttr('disabled');
    $searchBox.removeAttr('disabled');
};

module.exports = {
    init: function() {
        $('#main').on('submit', '#search, #large-search', function(e) {
            e.preventDefault();
            var $form = $(e.target),
                $submitButton = $form.find('input[type=submit]'),
                $searchBox = $form.find('input[name=search]'),
                searchQuery = $searchBox.val();

            $submitButton.attr('disabled', '');
            $searchBox.attr('disabled', '');
            events.emit('search:submitted', {'query': searchQuery});
        });

        $('#main').on('submit', '#large-search', function(e) {
            $('#main').html('');
        });

        events.on('bind:search', function() {
            $('.results-header a').on('click', function() {
                event.preventDefault();

                var context = {},
                    $target = $(event.target);

                context.category = $target.data('category');
                context.query = $target.data('query');

                $('#main').data('section', context.category);

                events.emit('load:searchResults', context);
            });
        });

        events.on('err:load:search', enableSearchForm);
        events.on('render:searchResultsList', enableSearchForm);
    }
};
