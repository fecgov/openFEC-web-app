var singularize = function(category) {
    return category.split('').slice(0, -1).join('');
};

var callAPI = function(url) {
    return $.ajax({
        url: url,
        success: function(data) {
            console.log(data);
        }
    });
};

module.exports = {
    init: function() {
        var events = require('./events.js');

        events.on('search:submitted', function(e) {
            console.log(e.query);
        });

        events.on('load:browse', function(e) {
            var promise = callAPI('rest/' + singularize(e.category));

            promise.done(function(data) {
                e.data = data;
                events.emit('render:browse', e);
            });
        });
    }
};
