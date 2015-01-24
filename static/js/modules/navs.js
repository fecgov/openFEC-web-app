'use strict';

var events = require('./events.js');

var navClickHandler = function(e) {
    e.preventDefault();

    events.emit('load:browse', {
        'category': e.target.name
    });

    changeActiveNavLink(e.target.name);
};

var changeActiveNavLink = function(category) {
    $('.page-nav__link').removeClass('active');
    $('.page-nav__link[name=' + category + ']').addClass('active');

    $('#main').data('section', category);
};

var renderHandler = function(e) {
    changeActiveNavLink(e.category);
};

var unhideNav = function() {
    $('.header-nav').removeClass('hidden'); 
};

var hideNav = function() {
    $('.header-nav').addClass('hidden');
};

module.exports = {
    init: function() {
        var section = $('#main').data('section');
        $('#main').on('click', 'a.page-nav__link', navClickHandler);
        $('#main').on('click', '.browse-links a', navClickHandler);

        events.on('render:browse', renderHandler);
        events.on('load:searchResults', unhideNav);
        events.on('load:browse', unhideNav);
        events.on('render:landingView', hideNav);
        events.on('search:submitted', unhideNav);
        events.on('render:singleEntity', unhideNav);
        
        if (typeof section !== 'undefined') {
            changeActiveNavLink(section);
        }
    }
};

