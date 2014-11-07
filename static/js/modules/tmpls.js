var urls = require('./urls.js');
var events = require('./events.js');
var Handlebars = require('handlebars');
var candidateHelpers = require('../../../shared/candidate-helpers.js');
var templates = {};

var renderBrowse = function(e) {
    var tmplName = e.category + '-table',
        promise = loadTemplate('views/partials/' + tmplName + '.handlebars');

        promise.done(function(data) {
            var context = {},
                totalPages;
            context.candidates = candidateHelpers.buildCandidateContext(e.data[2].results);
            context.resultsCount = e.data[1].pagination.count;
            context.page = e.data[1].pagination.page;
            totalPages = e.data[1].pagination.pages / e.data[1].pagination.per_page;
             if (typeof e.filters === 'undefined') {
                e.filters = {};
            }
           
            if (e.data[1].pagination.page < totalPages) {
                e.filters.page = e.data[1].pagination.page + 1;
                context.nextURL = urls.buildURL(e);
            }
            if (context.page > 1) {
                e.filters.page = e.data[1].pagination.page + 1;
                context.prevURL = urls.buildURL(e);
            }
            context.perPage = e.data[1].pagination.per_page;

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
    }
};
