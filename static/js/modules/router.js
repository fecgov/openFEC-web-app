'use strict';

var events = require('./events.js');
var _ = require('underscore');
var queryString = require('querystring');

var routeToTable = function(category) {
    var qs = queryString.parse(document.location.search),
        context = {},
        param;

    // cleanup
    for (param in qs) {
        if (qs.hasOwnProperty(param)) {
            if (param !== "") {
                context[param.replace(/\?/, '')] = qs[param];
            }
        }
    }

    if (_.isEmpty(context)) {
        events.emit('load:browse', {
            'category': category
        });
    }
    else {
        if (_.values(qs).length === 1 && typeof qs.q !== 'undefined') {
            events.emit('search:submitted', {'query': qs.q});
        }
        else {
            events.emit('load:searchResults', {
                'category': category,
                'filters': context
            });
        }
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
