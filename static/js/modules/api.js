var events = require('./events.js');

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

var buildURL = function(e) {
    var URL = 'rest/' + singularize(e.category) + '?';
    for (field in e.filters) {
        if (e.filters.hasOwnProperty(field)) {
            URL += field + '=' + e.filters[field] + '&'
        }
    }

    return URL;
};

var filterLoadHandler = function(e) {
    var url = buildURL(e),
        promise = callAPI(url);

    promise.done(function(data) {
        e.data = data;
        events.emit('render:browse', e);
    });
};

module.exports = {
    init: function() {
        events.on('search:submitted', function(e) {
            var promise = callAPI('rest/candidate?name=' + encodeURIComponent(e.query));

            promise.done(function(data) {
                e.data = data;
                // to be removed when search disambiguation is implemented
                e.category = 'candidates';
                events.emit('render:filters', e);
                events.emit('render:browse', e);
            });
        });

        events.on('load:browse', function(e) {
            var promise = callAPI('rest/' + singularize(e.category));

            promise.done(function(data) {
                e.data = data;
                events.emit('render:browse', e);
            });
        });

        events.on('selected:filter', filterLoadHandler);
        events.on('removed:filter', filterLoadHandler);
    },

    // for unit tests
    singularize: singularize,
    buildURL: buildURL
};
