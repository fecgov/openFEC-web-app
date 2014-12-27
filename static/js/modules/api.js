'use strict';

var events = require('./events.js'),
    _ = require('underscore');

var entityMap = {
    'candidates': 'candidate',
    'committees': 'committee'
};

var entitiesArray = ['candidate', 'committee'];

var callAPI = function(url) {
    return $.ajax({
        url: url
    });
};

var buildURL = function(e) {
    var URL = '/rest/' + entityMap[e.category],
        field;

    if (typeof e.id !== 'undefined') {
        URL += '/' + e.id;
    }

    URL += '?';

    if (typeof e.query !== 'undefined') {
        URL += 'q=' + e.query + '&';
    }

    for (field in e.filters) {
        // 'test' is for Selenium tests and shouldn't carry through
        if (e.filters.hasOwnProperty(field) && field !== 'test') {
            URL += field + '=' + e.filters[field] + '&'
        }
    }

    if (URL.indexOf('fields') === -1) {
        URL += 'fields=*';
    }

    return URL;
};

var promiseResolved = function(data, eventName, e) {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }

    e.data = data;
    events.emit(eventName, e);
}

var condenseResults = function(args, e) {
    var i,
        len = args.length,
        results = {};
    e.data = {};
    e.data.results = [];

    for (i = 0; i < len; i++) {
        if (typeof args[i][0] === 'string') {
            args[i][0] = JSON.parse(args[i][0]);
        }

        if (_.isEmpty(results)) {
            results = args[i][0].results;
        }
        else {
            results = _.extend(results, args[i][0].results);
        }
    }

    e.data.results = results;

    return e;
}

var filterLoadHandler = function(e) {
    var url = buildURL(e),
        promise = callAPI(url);

    promise.done(function(data) {
        promiseResolved(data, 'render:browse', e);
    }).fail(function() {
        events.emit('err:load:filters');
    });;
};

var loadSingleEntity = function(e) {
  var promises = [];

  promises.push(callAPI(buildURL(e)));
  promises.push(callAPI('rest/total/' + e.id));

  $.when.apply($, promises).done(function() {
    e = condenseResults(arguments, e);
    events.emit('render:singleEntity', e);
  }).fail(function() {
    events.emit('err:load:singleEntity');
  })
}

var loadSearchResultsList = function(e) {
    var entities = [],
        promises = [],
        i,
        len = entitiesArray.length;

    for (i = 0; i < len; i++) {
        promises.push(callAPI('rest/' + entitiesArray[i] + '?q=' + encodeURIComponent(e.query) + '&per_page=5'));
    }

    $.when.apply($, promises).done(function() {
        var i,
            len = arguments.length;
        e.data = {}
        e.data.results = {};

        for (i = 0; i < len; i++) {
            if (typeof arguments[i][0] === 'string') {
                arguments[i][0] = JSON.parse(arguments[i][0]);
            }
            e.data.results[entitiesArray[i]] = arguments[i][0].results;
        }
        events.emit('render:searchResultsList', e);
    }).fail(function() {
        events.emit('err:load:searchResultsList');
    });
}

var loadSearchResults = function(e) {
    var promise = callAPI(buildURL(e));

    promise.done(function(data) {
        promiseResolved(data, 'render:searchResults', e);
    }).fail(function() {
        events.emit('err:load:searchResults');
    });
}

var loadBrowse = function(e) {
    var promise = callAPI('/rest/' + entityMap[e.category] + '?fields=*');

    promise.done(function(data) {
        promiseResolved(data, 'render:browse', e);
    }).fail(function() {
        events.emit('err:load:browse');
    });
}

module.exports = {
    init: function() {
        events.on('search:submitted', loadSearchResultsList);
        events.on('load:browse', loadBrowse);
        events.on('load:searchResults', loadSearchResults);
        events.on('selected:filter', filterLoadHandler);
        events.on('deselected:filter', filterLoadHandler);
        events.on('nav:pagination', filterLoadHandler);
        events.on('load:singleEntity', loadSingleEntity);
    },

    entitiesArray: entitiesArray,

    // for unit tests
    buildURL: buildURL
};
