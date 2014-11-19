'use strict';

var events = require('./events.js');
var vex = require('vex-js');
vex.dialog = require('vex-js/js/vex.dialog.js');

var searchError = function() {
    vex.dialog.alert("Sorry, we couldn't load your search results. <br>Please try again.");
};

module.exports = {
    init: function() {
        vex.defaultOptions.className = 'vex-theme-default';
        events.on('err:load:searchResultsList', searchError);
        events.on('err:load:searchResults', searchError);
        events.on('err:load:filters', searchError);

        events.on('err:load:browse', function() {
            vex.dialog.alert("Sorry, we are having trouble loading your data. <br>Please try again.");
        });
    }
};
