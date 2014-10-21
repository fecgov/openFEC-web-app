var events = require('./events.js');

var navClickHandler = function(e) {
    e.preventDefault();

    events.emit('render:browse', {
        'category': e.target.name
    });

    changeActiveNavLink(e.target.name);
};

var changeActiveNavLink = function(category) {
    $('.header-nav-bar a').removeClass('active');
    $('.header-nav-bar a[name=' + category + ']').addClass('active');
};

module.exports = {
    init: function() {
        var section = $('#main').data('section');
        $('.header-nav-bar a').on('click', navClickHandler);
        $('.browse-links a').on('click', navClickHandler);

        if (typeof section !== 'undefined') {
            changeActiveNavLink(section);
        }
    }
};

