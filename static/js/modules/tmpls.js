var events = require('./events.js');
var Handlebars = require('handlebars');
var templates = {};

var renderBrowse = function(e) {
    var tmplName = e.category,
        promise = loadTemplate('views/' + tmplName + '.handlebars');

        promise.done(function(data) {
            var context = {};
            context.candidates = buildCandidateContext(e.data[2].results);
            templates[tmplName] = Handlebars.compile(data);
            $('#main').html(templates[tmplName](context));
            events.emit('bind:browse');
        }.bind(e));
};

var loadTemplate = function(url) {
    return $.ajax({
        url: url,
        dataType: 'text'
    });
};

var buildCandidateContext = function(results) {
    var candidates = [],
        i = 0,
        len = results.length,
        elections,
        election,
        year;

    for (i; i < len; i++) {
        elections = results[i].elections;
        year = Object.keys(elections)[0];
        election = elections[year];

        candidates[i] = {
            'name': results[i].name.full_name,
            'office': election.office_sought,
            'election': year,
            'party': election.party_affiliation,
            'state': election.state,
            'district': election.district
        }
    }

    return candidates;
};

module.exports = {
    init: function() {
        events.on('render:browse', renderBrowse);
    }
};
