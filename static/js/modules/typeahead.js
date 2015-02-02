'use strict';
var Handlebars = require('handlebars');
var events = require('./events.js');

var filterCandidates = function(result) {

  var officeFull,
      officeMap,
      filteredResults;
  
  officeMap = {
    "H": "House of Representatives",
    "S": "Senate",
    "P": "President"
  }

  officeFull = officeMap[result.office_sought];

  filteredResults =   {
    name: result.name,
    id: result.candidate_id,
    office: officeFull
  }
  return filteredResults;
}

var filterCommittees = function(result) {
  var filteredResults =   {
    name: result.name,
    id: result.committee_id
  }
  return filteredResults;
}

module.exports = {
  init: function(){
    var candidateEngine,
        committeeEngine,
        candidateSuggestion,
        committeeSuggestion,
        headerTpl;
    
    // Creating a candidate suggestion engine
    candidateEngine = new Bloodhound({
      name: 'Candidates',
      remote: {
        url: "/rest/name?q=%QUERY",
        filter: function(response) {
          var results = $.map(response.results, function(result){
            if ( result.candidate_id !== null ) {
              return filterCandidates(result);
            }            
          });
          return results;
        }
      },
      datumTokenizer: function(d) {
        var tokens = Bloodhound.tokenizers.whitespace(d.name);
        return tokens;
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 3
    });
    candidateEngine.initialize();

    // Committee Engine
    committeeEngine = new Bloodhound({
      name: 'Committees',
      remote: {
        url: "/rest/name?q=%QUERY",
        filter: function(response) {
          var results = $.map(response.results, function(result) {
            if ( result.committee_id !== null ) {
              return filterCommittees(result);              
            }
          });
          return results;
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
      limit: 3
    });

    committeeEngine.initialize();

    // Templates for results
    candidateSuggestion = Handlebars.compile('<span><span class="tt-suggestion__name">{{ name }}</span> <span class="tt-suggestion__office">{{ office }}</span></span>');
    committeeSuggestion = Handlebars.compile('<span>{{ name }}</span>');
    headerTpl = function(label) {
      return Handlebars.compile('<span class="tt-dropdown-title">' + label + '</span>');
    }

    // Setting up typeahead
    $('.search-bar').typeahead({
      minLength: 3,
      highlight: true,
      hint: false
    },
    {
      name: 'candidates',
      displayKey: 'name',
      source: candidateEngine.ttAdapter(),
      templates: {
        suggestion: candidateSuggestion,
        header: headerTpl('Candidates'),
      }
    },
    {
      name: 'committees',
      displayKey: 'name',
      source: committeeEngine.ttAdapter(),
      templates: {
        suggestion: committeeSuggestion,
        header: headerTpl('Committees'),
      }
    }
    );

    $('.twitter-typeahead').css({
      display: 'block',
    })

    // Open single entity pages when selected
    $(document).on('typeahead:selected', function(e, suggestion, datasetName) {
        document.location = document.location.origin + '/' + datasetName + '/' + suggestion.id;
    })
  }
}
