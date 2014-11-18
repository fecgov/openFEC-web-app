'use strict';

var events = require('./events.js');
var vex = require('vex-js');
vex.dialog = require('vex-js/js/vex.dialog.js');

module.exports = {
    init: function() {
        $('#search').on('submit', function(e) {
            e.preventDefault();
            var $form = $(e.target),
                $submitButton = $form.find('input[type=submit]'),
                $searchBox = $form.find('input[name=search]'),
                searchQuery = $searchBox.val();

            $submitButton.attr('disabled', '');
            $searchBox.attr('disabled', '');
            events.emit('search:submitted', {'query': searchQuery});

            $('.header-nav').removeClass('hidden');
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

        events.on('err:load:search', function() {
            var $form = $('form#search'),
                $submitButton = $form.find('input[type=submit]'),
                $searchBox = $form.find('input[name=search]');

                $submitButton.removeAttr('disabled');
                $searchBox.removeAttr('disabled');

                vex.dialog.alert("Sorry, we couldn't load your search results. Please try again.");
        });
    }
};
