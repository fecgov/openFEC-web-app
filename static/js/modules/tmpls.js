var events = require('./events.js');
var Handlebars = require('handlebars');
var candidateHelpers = require('../../../shared/candidate-helpers.js');
var templates = {};

var renderBrowse = function(e) {
    var tmplName = e.category + '-table',
        promise = loadTemplate('views/partials/' + tmplName + '.handlebars');

        promise.done(function(data) {
            var context = {},
            page = e.data[1].pagination.page;
            context.candidates = candidateHelpers.buildCandidateContext(e.data[2].results);
            context.resultsCount = e.data[1].pagination.count;
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
        events.emit('bind:filters');
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
        events.on('render:filters', renderFilters);
    }
};
