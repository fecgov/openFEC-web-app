'use strict';

/* global require, module, window, Bloodhound, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var _ = require('underscore');
require('typeahead.js');
var URI = require('URIjs');
var Handlebars = require('handlebars');

var events = require('./events.js');
var terms = require('./terms');
var glossary = require('./glossary.js');


var officeMap = {
  H: 'House of Representatives',
  S: 'Senate',
  P: 'President'
};

var filterCandidates = function(result) {
  return {
    name: result.name,
    id: result.candidate_id,
    office: officeMap[result.office_sought]
  };
};

var filterCommittees = function(result) {
  return {
    name: result.name,
    id: result.committee_id
  };
};

module.exports = {
  init: function(){
    var candidateEngine,
        committeeEngine,
        candidateSuggestion,
        committeeSuggestion,
        headerTpl,
        glossaryEngine,
        glossarySuggestion,
        url = "/rest/names?q=%QUERY";

    if (typeof API_LOCATION !== 'undefined') {
        url = URI(API_LOCATION)
          .path([API_VERSION, 'names'].join('/'))
          .query({
            q: '%QUERY',
            api_key: API_KEY
          })
          .readable();
    }

    // Creating a candidate suggestion engine
    candidateEngine = new Bloodhound({
      name: 'Candidates',
      remote: {
        url: url,
        filter: function(response) {
          return _.chain(response.results)
            .filter(function(result) {
              return result.candidate_id;
            })
            .map(function(result) {
              return filterCandidates(result);
            })
            .value();
        }
      },
      datumTokenizer: function(d) {
        var tokens = Bloodhound.tokenizers.whitespace(d.name);
        return tokens;
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 5
    });
    candidateEngine.initialize();

    // Committee Engine
    committeeEngine = new Bloodhound({
      name: 'Committees',
      remote: {
        url: url,
        filter: function(response) {
          return _.chain(response.results)
            .filter(function(result) {
              return result.committee_id;
            })
            .map(function(result) {
              return filterCommittees(result);
            })
            .value();
        }
      },
      datumTokenizer: function(d) {
        var tokens = Bloodhound.tokenizers.whitespace(d.name);
        return tokens;
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      dupDetector: function(remoteMatch, localMatch) {
        return remoteMatch.name === localMatch.name;
      },
      limit: 5
    });

    committeeEngine.initialize();

    // Templates for results
    candidateSuggestion = Handlebars.compile('<span><span class="tt-suggestion__name">{{ name }}</span> <span class="tt-suggestion__office">{{ office }}</span></span>');
    committeeSuggestion = Handlebars.compile('<span>{{ name }}</span>');
    headerTpl = function(label) {
      return Handlebars.compile('<span class="tt-dropdown-title">' + label + '</span>');
    };

    // Setting up main search typehead
    $('.search-bar').typeahead({
      minLength: 3,
      highlight: true,
      hint: false
    },
    {
      name: 'candidate',
      displayKey: 'name',
      source: candidateEngine.ttAdapter(),
      templates: {
        suggestion: candidateSuggestion,
        header: headerTpl('Candidates'),
      }
    },
    {
      name: 'committee',
      displayKey: 'name',
      source: committeeEngine.ttAdapter(),
      templates: {
        suggestion: committeeSuggestion,
        header: headerTpl('Committees'),
      }
    }
    );
    // Open single entity pages when selected
    $('.search-bar').on('typeahead:selected', function(event, datum, datasetName) {
        window.location = window.location.origin + '/' + datasetName + '/' + datum.id;
    });

    // Glossary typeahead
    glossaryEngine = new Bloodhound({
      name: 'Glossary',
      local: terms,
      datumTokenizer: function(d) {
          var tokens = Bloodhound.tokenizers.whitespace(d.term);
          return tokens;
        },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 5
    });

    glossaryEngine.initialize();
    glossarySuggestion = Handlebars.compile('<span>{{ term }}</span>');
    $('#glossary-search').typeahead({
            minLength: 1,
            highlight: true,
            hint: false
        },
        {
            name: 'Definitions',
            displayKey: 'term',
            source: glossaryEngine.ttAdapter(),
            templates: {
              suggestion: glossarySuggestion,
            }
        }
    );
    $('#glossary-search').on('typeahead:selected', function(event, datum) {
        glossary.setDefinition({
            term: datum.term,
            definition: datum.definition
        });
    });

    $('.twitter-typeahead').css({
        display: 'block',
    });

  }
};
