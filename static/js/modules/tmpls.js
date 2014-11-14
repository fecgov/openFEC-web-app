'use strict';

var urls = require('./urls.js');
var events = require('./events.js');
var Handlebars = require('handlebars');
var candidateHelpers = require('../../../shared/candidate-helpers.js');
var categories = require('./api.js').entitiesArray;
var templates = {};

var renderBrowse = function(e) {
    var tmplName = e.category + '-table',
        promise = loadTemplate('views/partials/' + tmplName + '.handlebars');

        promise.done(function(data) {
            var context = {},
                totalPages;

            context.candidates = candidateHelpers.buildCandidateContext(e.data.results);
            context.resultsCount = e.data.pagination.count;
            context.page = e.data.pagination.page;
            totalPages = e.data.pagination.pages / e.data.pagination.per_page;
             if (typeof e.filters === 'undefined') {
                e.filters = {};
            }

            if (e.data.pagination.page < totalPages) {
                e.filters.page = e.data.pagination.page + 1;
                context.nextURL = urls.buildURL(e);
            }
            if (context.page > 1) {
                e.filters.page = e.data.pagination.page + 1;
                context.prevURL = urls.buildURL(e);
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
};

var renderFilters = function(e) {
    var tmplName = e.category,
        partialName = tmplName + '-table';

    // pre-load table partial so the template can be shared on client + server
    $.when(
        loadTemplate('views/' + tmplName + '.handlebars'),
        loadTemplate('views/partials/' + tmplName + '-table.handlebars')
    ).done(function(tmpl1, tmpl2) {
        templates[tmplName] = Handlebars.compile(tmpl1[0]);
        templates[partialName] = Handlebars.registerPartial(partialName, tmpl2[0]);
        $('#main').html(templates[tmplName]());
        events.emit('bind:filters', e);
    });
};

var renderSearch = function(e) {
    var promises = [],
        i,
        len = categories.length;

    promises.push(loadTemplate('views/search-results.handlebars'));
    promises.push(loadTemplate('views/partials/search-bar.handlebars'));

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
        templates['search-bar'] = Handlebars.registerPartial('search-bar', arguments[1][0]);

        for (i = 2; i < len; i++) {
            tmplName = categories[i - 2] + 's-table';
            category = categories[i - 2] + 's';
            templates[tmplName] = Handlebars.registerPartial(tmplName, arguments[i][0]);
            context[category] = mapFields(category, e.results[categories[i - 2]]);
        } 

        $('#main').html(templates['search-results'](context));
    });
};

var mapFields = function(category, results) {
    if (category === 'candidates') {
        return candidateHelpers.buildCandidateContext(results);
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
        events.on('render:search', renderSearch);
    }
};
