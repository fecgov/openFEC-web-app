'use strict';
var Handlebars = require('handlebars');
var events = require('./events.js');

module.exports = {
  init: function() {
    // Creating a candidate suggestion engine
    var candidatesEngine = new Bloodhound({
      name: 'Candidates',
      prefetch: {
        url: "js/data/candidates_2012.json", // Prefetch 648 candidates from 2012
        filter: function(response) {
          var results = $.map(response.results, function(result) {
            var filteredResults =   {
              name: result.name.full_name,
              id: result.candidate_id
            }
            return filteredResults;
          });
          return results;
        }
      },
      remote: {
        url: "/rest/candidate?name=%QUERY",
        filter: function(response) {
          var results = $.map(response.results, function(result) {
            var filteredResults =   {
              name: result.name.full_name,
              id: result.candidate_id
            }
            return filteredResults;
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
    candidatesEngine.initialize();


    // Committee Engine
    var committeeEngine = new Bloodhound({
      name: 'Committees',
      prefetch: {
        url: "js/data/committees_p.json", // Prefetch 2000 Principal committees
        filter: function(response) {
          var results = $.map(response.results, function(result) {
            var filteredResults =   {
              name: result.name,
              id: result.committee_id
            }
            return filteredResults;
          });
          return results;
        }
      },
      remote: {
        url: "/rest/committee?name=%QUERY",
        filter: function(response) {
          var results = $.map(response.results, function(result) {
            var filteredResults =   {
              name: result.name,
              id: result.committee_id
            }
            return filteredResults;
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
    var suggestionTpl = Handlebars.compile('<span>{{ name }} (id: {{ id }})</span>');
    function headerTpl(label) {
      return Handlebars.compile('<h5>' + label + '</h5>');
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
        suggestion: suggestionTpl,
        header: headerTpl('Candidates'),
      }
    },
    {
      name: 'committees',
      displayKey: 'name',
      source: committeeEngine.ttAdapter(),
      templates: {
        suggestion: suggestionTpl,
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
