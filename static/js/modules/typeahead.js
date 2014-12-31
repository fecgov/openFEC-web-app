'use strict';
var Handlebars = require('handlebars');

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
      queryTokenizer: Bloodhound.tokenizers.whitespace
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
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    committeeEngine.initialize();

    $('.search-bar').typeahead({
      minLength: 3,
      highlight: true,
      hint: false
    },
    {
      name: 'Candidates',
      displayKey: 'name',
      source: candidatesEngine.ttAdapter(),
      templates: {
        suggestion: Handlebars.compile('<span class="single-link" data-id="{{ id }}" data-category="candidate">{{ name }}: {{ id }}</span>'),
        header: Handlebars.compile('<h5>Candidates</h5>'),
      }
    },
    {
      name: 'Committees',
      displayKey: 'name',
      source: committeeEngine.ttAdapter(),
      templates: {
        suggestion: Handlebars.compile('<span class="single-link" data-id="{{ id }}" data-category="committee">{{ name }}: {{ id }}</span>'),
        header: Handlebars.compile('<h5>Committees</h5>'),
      }
    }
    )

    $('.twitter-typeahead').css({
      display: 'block',
    })
  }
}
