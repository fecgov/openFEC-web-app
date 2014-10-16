module.exports = {
    init: function() {
        var events = require('./events.js');

        events.on('search:submitted', function(e) {
            console.log(e.query);
        });
    }
};
