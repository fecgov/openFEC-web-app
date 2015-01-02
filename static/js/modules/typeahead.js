'use strict';
var Handlebars = require('handlebars');
var events = require('./events.js');

module.exports = {
  init: function() {
    function filterCandidates(result) {
      // Label House, President, Senate
      var officeFull;
      switch(result.elections[0].office_sought) {
        case "H":
          officeFull = "House of Representatives";
          break;
        case "S":
          officeFull = "Senate";
          break;
        case "P":
          officeFull = "President";
          break;
      }
      var filteredResults =   {
        name: result.name.full_name,
        id: result.candidate_id,
        office: officeFull
      }
      return filteredResults;
    }

    function filterCommittees(result) {
      var filteredResults =   {
        name: result.name,
        id: result.committee_id
      }
      return filteredResults;
    }

    // Creating a candidate suggestion engine
    var candidatesEngine = new Bloodhound({
      name: 'Candidates',
      prefetch: {
        url: "js/data/candidates_2014.json", // Prefetch all 2014 candidates
        filter: function(response) {
          var results = $.map(response.results, function(result){
            return filterCandidates(result);
          });
          return results;
        }
      },
      remote: {
        url: "/rest/candidate?name=%QUERY&fields=name,candidate_id,office_sought",
        filter: function(response) {
          var results = $.map(response.results, function(result){
            return filterCandidates(result);
          });
          return results;
        }
      },
      datumTokenizer: function(d) {
        var tokens = Bloodhound.tokenizers.whitespace(d.name);
        return tokens;
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      // dupDetector: function(remoteMatch, localMatch) {
      //   return remoteMatch.name === localMatch.name;
      // },
      // limit: 5
    });
    candidatesEngine.clearPrefetchCache();
    candidatesEngine.initialize();


    // Committee Engine
    var committeeEngine = new Bloodhound({
      name: 'Committees',
      prefetch: {
        url: "js/data/committees_p.json", // Prefetch 2000 Principal committees
        filter: function(response) {
          var results = $.map(response.results, function(result) {
            return filterCommittees(result);
          });
          return results;
        }
      },
      remote: {
        url: "/rest/committee?name=%QUERY&fields=name,committee_id",
        filter: function(response) {
          var results = $.map(response.results, function(result) {
            return filterCommittees(result);
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
    committeeEngine.clearPrefetchCache();
    committeeEngine.initialize();

    // Templates for results
    var candidateSuggestion = Handlebars.compile('<span>{{ name }} <span class="tt-suggestion__office">{{ office }}</span></span>');
    var committeeSuggestion = Handlebars.compile('<span>{{ name }}</span>');

    function headerTpl(label) {
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
      source: candidatesEngine.ttAdapter(),
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
    )

    $('.twitter-typeahead').css({
      display: 'block',
    })

    // Open single entity pages when selected
    $(document).on('typeahead:selected', function(e, suggestion, datasetName) {
      events.emit('load:singleEntity', {
        category: datasetName,
        id: suggestion.id
      });
    })
  }
}
