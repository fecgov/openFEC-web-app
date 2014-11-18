'use strict';

var events = require('./events.js');
var NProgress = require('nprogress');

module.exports = {
    init: function() {
        events.on('search:submitted', NProgress.start);
        events.on('load:browse', NProgress.start);
        events.on('selected:filter', NProgress.start);
        events.on('deselected:filter', NProgress.start);
        events.on('nav:pagination', NProgress.start);

        events.on('render:browse', NProgress.done);
        events.on('render:filters', NProgress.done);
        events.on('render:search', NProgress.done);
        events.on('err:load:search', NProgress.done);       
    }
};
