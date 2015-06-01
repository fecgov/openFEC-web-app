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
  getUrl: function() {
    var url;
    if (typeof API_LOCATION !== 'undefined') {
        url = URI(API_LOCATION)
          .path([API_VERSION, 'names'].join('/'))
          .query({
            q: '%QUERY',
            api_key: API_KEY
          })
          .readable();
    } else {
      url = "/rest/names?q=%QUERY";
    }
    return url;
  },

  getCandidateUrl: function(url) {
    return URI(url).addSearch('type', 'candidate').readable();
  },

  getCommitteeUrl: function(url) {
    return URI(url).addSearch('type', 'committee').readable();
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

    $('.twitter-typeahead').css({
        display: 'flex',
    });
  },

  init: function(){
    var candidateEngine,
        committeeEngine,
        candidateSuggestion,
        committeeSuggestion,
        headerTpl,
        glossaryEngine,
        glossarySuggestion,
        options,
        candidateDataSet,
        committeeDataSet,
        url,
        self = this;

    url = this.getUrl();

    // Creating a candidate suggestion engine
    candidateEngine = this.createEngine('Candidates', this.getCandidateUrl(url),
      function(response) {
          return _.chain(response.results)
            .filter(function(result) {
              return result.candidate_id;
            })
            .map(function(result) {
              return filterCandidates(result);
            })
            .value();
        });
    committeeEngine = this.createEngine('Committees', this.getCommitteeUrl(url),
      function(response) {
          return _.chain(response.results)
            .filter(function(result) {
              return result.committee_id;
            })
            .map(function(result) {
              return filterCommittees(result);
            })
            .value();
        });

    // Templates for results
    candidateSuggestion = Handlebars.compile(
      '<span><span class="tt-suggestion__name">{{ name }}</span>' +
      '<span class="tt-suggestion__office">{{ office }}</span></span>');
    committeeSuggestion = Handlebars.compile('<span>{{ name }}</span>');
    headerTpl = function(label) {
      return Handlebars.compile('<span class="tt-dropdown-title">' + label +
          '</span>');
    };

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
        suggestion: candidateSuggestion,
        header: headerTpl('Candidates'),
      }
    };

    committeeDataSet = {
      name: 'committee',
      displayKey: 'name',
      source: committeeEngine.ttAdapter(),
      templates: {
        suggestion: committeeSuggestion,
        header: headerTpl('Committees'),
      }
    };

    this.initTypeahead(options, candidateDataSet);

    // When the select committee or candidate box is changed on the search.
    events.on('searchTypeChanged', function(data) {
      $('.search-bar').typeahead('destroy');
      if (data.type === 'committees') {
        self.initTypeahead(options, committeeDataSet);
      } else {
        self.initTypeahead(options, candidateDataSet);
      }
    });

    // Glossary typeahead
    glossaryEngine = this.createEngine('Glossary', terms);
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
        display: 'flex',
    });
  }
};
