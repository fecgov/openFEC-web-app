'use strict';

var events = require('./events.js');
var _ = require('underscore');
var queryString = require('querystring');

var routeToTable = function(category) {
    var qs = queryString.parse(document.location.search);

    if (_.isEmpty(qs)) {
        events.emit('load:browse', {
            'category': category
        });
    }
};

module.exports = {
    init: function() {

        window.onpopstate = function() {
            var queryString = require('querystring');

            switch (document.location.pathname) {
                case '/candidates':
                    routeToTable('candidates');
                    break;
                case '/committees':
                    routeToTable('committees');
                    break;
                case '/':
                    events.emit('render:landingView');
                    break;
            }
        }
   }
};
