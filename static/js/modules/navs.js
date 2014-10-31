var events = require('./events.js');

var navClickHandler = function(e) {
    e.preventDefault();

    events.emit('render:filters', {
        'category': e.target.name
    });

    changeActiveNavLink(e.target.name);
};

var changeActiveNavLink = function(category) {
    $('.header-nav-bar a').removeClass('active');
    $('.header-nav-bar a[name=' + category + ']').addClass('active');
};

var renderHandler = function(e) {
    changeActiveNavLink(e.category);
};

module.exports = {
    init: function() {
        var section = $('#main').data('section');
        $('.header-nav-bar a:not([name=search])').on('click', navClickHandler);
        $('.browse-links a').on('click', navClickHandler);

        events.on('render:browse', renderHandler);

        if (typeof section !== 'undefined') {
            changeActiveNavLink(section);
        }
    }
};

