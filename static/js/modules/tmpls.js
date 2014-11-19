'use strict';

var urls = require('./urls.js');
var events = require('./events.js');
var Handlebars = require('handlebars');
var candidateHelpers = require('../../../shared/candidate-helpers.js');
var committeeHelpers = require('../../../shared/committee-helpers.js');
var categories = require('./api.js').entitiesArray;
var templates = {};

var renderBrowse = function(e) {
    if (typeof e.data.results === 'undefined' || e.data.results.length === 0) {
        $('#' + e.category).html('No results matched your query.');
    }
    else {
        var tmplName = e.category + '-table',
            promise = loadTemplate('views/partials/' + tmplName + '.handlebars');

        promise.done(function(data) {
            var context = {};

            context[e.category] = mapFields(e.category, e.data.results);
            context.resultsCount = e.data.pagination.count;
            context.page = e.data.pagination.page;

            if (typeof e.filters === 'undefined') {
                e.filters = {};
            }

            // if we are not at the last page, build next page url
            if (e.data.pagination.page < e.data.pagination.pages) {
                // bump up page to build next page's url
                e.filters.page = e.data.pagination.page + 1;
                context.nextURL = urls.buildURL(e);

                // reset page filter
                e.filters.page = e.data.pagination.page;
            }

            // if this is not the first page, build prev page url
            if (context.page > 1) {
                // drop page number down to build prev page url
                e.filters.page = e.data.pagination.page - 1;
                context.prevURL = urls.buildURL(e);

                // reset page filter
                e.filters.page = e.data.pagination.page;
            }
            if (context.prevURL || context.nextURL) {
                context.paginationLinks = true;
            }

            context.perPage = e.data.pagination.per_page;
            context.currentResultsStart = context.perPage * (context.page - 1) + 1;
            context.currentResultsEnd = context.perPage * context.page;

            if (context.currentResultsEnd && context.currentResultsStart) {
                context.resultsRange = true;
            }

            templates[tmplName] = Handlebars.compile(data);
            $('#' + e.category).html(templates[tmplName](context));
            events.emit('bind:browse');
        }.bind(e));
    }
};

var renderSearchResults = function(e) {
    e.searchResults = true;
    renderFilters(e);
    renderBrowse(e);
};

var renderFilters = function(e) {
    var tmplName = e.category,
        partialName = tmplName + '-table',
        context = {};

        if (e.searchResults && e.query) {
            context.heading = 'Search Results: ' + e.query;
        }
        else {
            context.heading = 'Browse ' + e.category;
        }

    // pre-load table partial so the template can be shared on client + server
    $.when(
        loadTemplate('views/' + tmplName + '.handlebars'),
        loadTemplate('views/partials/' + tmplName + '-table.handlebars')
    ).done(function(tmpl1, tmpl2) {
        templates[tmplName] = Handlebars.compile(tmpl1[0]);
        templates[partialName] = Handlebars.registerPartial(partialName, tmpl2[0]);
        $('#main').html(templates[tmplName](context));
        events.emit('bind:filters', e);
    });
};

var renderSearchResultsList = function(e) {
    var promises = [],
        i,
        len = categories.length;

    promises.push(loadTemplate('views/search-results.handlebars'));

    for (i = 0; i < len; i++) {
        promises.push(loadTemplate('views/partials/' + categories[i] + 's-table.handlebars'));
    }

    $.when.apply($, promises).done(function() {
        var i,
            len = arguments.length,
            tmplName,
            context = {},
            category;

        templates['search-results'] = Handlebars.compile(arguments[0][0]);

        for (i = 1; i < len; i++) {
            tmplName = categories[i - 1] + 's-table';
            category = categories[i - 1] + 's';
            templates[tmplName] = Handlebars.registerPartial(tmplName, arguments[i][0]);
            context[category] = mapFields(category, e.results[categories[i - 1]]);
        } 

        context.query = e.query;

        $('#main').html(templates['search-results'](context));
        $('input[name=search]')[0].value = e.query;

        events.emit('bind:search');
    });
};

var renderLandingView = function() {
    $.when(
        loadTemplate('views/search.handlebars'),
        loadTemplate('views/partials/search-bar.handlebars')
    ).done(function(tmpl1, tmpl2) {
        templates['landing'] = Handlebars.compile(tmpl1[0]);
        templates['search-bar'] = Handlebars.registerPartial('search-bar', tmpl2[0]);
        $('#main').html(templates['landing']());
    });

    events.emit('render:landingView');
};

var mapFields = function(category, results) {
    switch (category) {
        case "candidates":
            return candidateHelpers.buildCandidateContext(results);
            break;
        case "committees":
            return committeeHelpers.buildCommitteeContext(results);
            break;
    }
};

var loadTemplate = function(url) {
    return $.ajax({
        url: url,
        dataType: 'text'
    });
};

module.exports = {
    init: function() {
        events.on('render:browse', renderBrowse);
        events.on('load:browse', renderFilters);
        events.on('render:filters', renderFilters);
        events.on('render:searchResults', renderSearchResults);
        events.on('render:searchResultsList', renderSearchResultsList);
        events.on('err:load:searchResults', renderLandingView);
        events.on('err:load:searchResultsList', renderLandingView);
    }
};
