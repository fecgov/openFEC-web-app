var events = require('./events.js');

var navClickHandler = function(e) {
    e.preventDefault();

    events.emit('render:browse', {
        'category': e.target.name
    });
};

module.exports = {
    init: function() {
        $('.header-nav-bar a').on('click', navClickHandler);
        $('.browse-links a').on('click', navClickHandler);
    }
};

