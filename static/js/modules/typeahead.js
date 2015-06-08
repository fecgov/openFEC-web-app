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

var SUGGESTION_LIMIT = 10;

var officeMap = {
  H: 'House',
  S: 'Senate',
  P: 'President'
};

function filterCandidates(result) {
  return {
    name: result.name,
    id: result.id,
    office: officeMap[result.office_sought]
  };
}

module.exports = {
  getUrl: function(resource) {
    return URI(API_LOCATION)
      .path([API_VERSION, 'names', resource].join('/'))
      .query({
        q: '%QUERY',
        api_key: API_KEY
      })
      .readable();
  },

  /**
   * Create a Bloodhound search engine.
   *
   * @param {String} name The name of the engine passed as the name parameter
   * to Bloundhound.
   * @param {String|Object} dataSource If a string, will assume its a url and
   * will set it as a remote. If anything else, will assume it's local data.
   * @return {Object}
   */
  createEngine: function(name, dataSource, filter) {
    var engine,
        options = {
      name: name,
      datumTokenizer: function(d) {
        var tokens = Bloodhound.tokenizers.whitespace(d.name);
        if (name === 'Glossary') {
          tokens = Bloodhound.tokenizers.whitespace(d.term);
        }
        return tokens;
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: SUGGESTION_LIMIT
    };

    if (_.isString(dataSource)) {
      options.remote = {
        url: dataSource
      };
      if (filter) {
        options.remote.filter = filter;
      }
    } else {
      options.local = dataSource;
    }

    if (name === 'Committees') {
      options.dupDetector = function(remoteMatch, localMatch) {
        return remoteMatch.name === localMatch.name;
      };
    }

    engine = new Bloodhound(options);
    engine.initialize();

    return engine;
  },

  initTypeahead: function(options, dataset) {
    // Setting up main search typehead
    $('.search-bar').typeahead(options, dataset);

    // Open single entity pages when selected
    $('.search-bar').on('typeahead:selected', function(event, datum, datasetName) {
      window.location = window.location.origin + '/' + datasetName + '/' + datum.id;
    });

    $('.twitter-typeahead').addClass('flex-container').css('display','');
  },

  init: function(){
    var candidateEngine,
        committeeEngine,
        candidateSuggestion,
        committeeSuggestion,
        glossaryEngine,
        glossarySuggestion,
        options,
        candidateDataSet,
        committeeDataSet,
        self = this;

    // Creating a candidate suggestion engine
    candidateEngine = this.createEngine('Candidates', this.getUrl('candidates'), function(response) {
      return _.map(response.results, function(result) {
        return filterCandidates(result);
      });
    });

    committeeEngine = this.createEngine('Committees', this.getUrl('committees'), function(response) {
      return response.results;
    });

    // Templates for results
    candidateSuggestion = Handlebars.compile(
      '<span><span class="tt-suggestion__name">{{ name }}</span>' +
      '<span class="tt-suggestion__office">{{ office }}</span></span>');
    committeeSuggestion = Handlebars.compile('<span>{{ name }}</span>');

    options = {
      minLength: 3,
      highlight: true,
      hint: false
    };

    candidateDataSet = {
      name: 'candidate',
      displayKey: 'name',
      source: candidateEngine.ttAdapter(),
      templates: {
        suggestion: candidateSuggestion
      }
    };

    committeeDataSet = {
      name: 'committee',
      displayKey: 'name',
      source: committeeEngine.ttAdapter(),
      templates: {
        suggestion: committeeSuggestion
      }
    };

    function updateTypeahead(dataType) {
      $('.search-bar').typeahead('destroy');
      if (dataType === 'committees') {
        self.initTypeahead(options, committeeDataSet);
      } else {
        self.initTypeahead(options, candidateDataSet);
      }
    }

    updateTypeahead($('select[name="search_type"]').val());

    // When the select committee or candidate box is changed on the search.
    events.on('searchTypeChanged', function(data) {
      $('.search-bar').typeahead('destroy');
      updateTypeahead(data.type);
    });
  }
};
