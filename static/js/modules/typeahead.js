'use strict';

/* global require, module, window, document, Bloodhound, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var _ = require('underscore');
require('typeahead.js');
var URI = require('URIjs');
var Handlebars = require('handlebars');
var keyboard = require('keyboardjs');

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

function getUrl(resource) {
  return URI(API_LOCATION)
    .path([API_VERSION, 'names', resource].join('/'))
    .query({
      q: '%QUERY',
      api_key: API_KEY
    })
    .readable();
}

/**
  * Create a Bloodhound search engine.
  *
  * @param {String} name The name of the engine passed as the name parameter
  * to Bloundhound.
  * @param {String|Object} dataSource If a string, will assume its a url and
  * will set it as a remote. If anything else, will assume it's local data.
  * @return {Object}
  */
function createEngine(name, dataSource, filter) {
  var engine;
  var options = {
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
}

var candidateEngine = createEngine('Candidates', getUrl('candidates'), function(response) {
  return _.map(response.results, function(result) {
    return filterCandidates(result);
  });
});

var committeeEngine = createEngine('Committees', getUrl('committees'), function(response) {
  return response.results;
});

// Templates for results
var candidateSuggestion = Handlebars.compile(
  '<span><span class="tt-suggestion__name">{{ name }}</span>' +
  '<span class="tt-suggestion__office">{{ office }}</span></span>');
var committeeSuggestion = Handlebars.compile('<span>{{ name }}</span>');

module.exports = {

  candidateDataSet: {
    name: 'candidate',
    displayKey: 'name',
    source: candidateEngine.ttAdapter(),
    templates: {
      suggestion: candidateSuggestion
    }
  },

  committeeDataSet: {
    name: 'committee',
    displayKey: 'name',
    source: committeeEngine.ttAdapter(),
    templates: {
      suggestion: committeeSuggestion
    }
  },

  initTypeahead: function(options, dataset) {

    var $searchBar = $('.js-search-input');

    // Setting up main search typehead
    $searchBar.typeahead(options, dataset);

    // Update placeholder text
    $searchBar.attr('placeholder', 'Enter a ' + dataset.name + ' name');

    // Open single entity pages when selected
    $searchBar.on('typeahead:selected', function(event, datum, datasetName) {
      window.location = window.location.origin + '/' + datasetName + '/' + datum.id;
    });

    $('.twitter-typeahead').addClass('flex-container').css('display','');
  },

  init: function(){
    var candidateEngine,
        committeeEngine,
        glossaryEngine,
        glossarySuggestion,
        options,
        self = this;

    options = {
      minLength: 3,
      highlight: true,
      hint: false
    };

    this.initTypeahead(options, this.candidateDataSet);

    // Focus on search bar on "/"
    keyboard.on('/', function(e) {
      e.preventDefault();
      var bar = _.find($('.js-search-input'), function(bar) {
        return $(bar).is(':visible');
      });
      if (bar) {
        bar.focus();
      }
    });

    // When the select committee or candidate box is changed on the search.
    function updateTypeahead(dataType) {
      $('.js-search-input').typeahead('destroy');
      if (dataType === 'committees') {
        self.initTypeahead(options, self.committeeDataSet);
      } else {
        self.initTypeahead(options, self.candidateDataSet);
      }
    }

    updateTypeahead($('.js-search-type:checked').val());

    // When the select committee or candidate box is changed on the search.
    events.on('searchTypeChanged', function(data) {
      $('.js-search-input').typeahead('destroy');
      updateTypeahead(data.type);
    });
  }
};
