'use strict';

var events = require('./events.js');

var initChosen = function() {
    $('.chosen-select').chosen({
        width: "100%",
        disable_search: true,
    });
}

module.exports = {
    init: function() {
        events.on('bind:singleEntity', initChosen);
    }
};
