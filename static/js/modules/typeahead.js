'use strict';
var Handlebars = require('handlebars');

module.exports = {
  init: function() {
    // Creating a candidate suggestion engine
    var candidatesEngine = new Bloodhound({
      name: 'candidates',
      prefetch: {
        url: "js/data/candidates_2012.json", // Prefetch 648 candidates from 2012
        filter: function(response) {
          var results = response.results;
          results = $.map(results, function(result) { return {name: result.name.full_name } });
          return results;
        }
      },
      remote: {
        url: "/rest/candidate?name=%QUERY",
        filter: function(response) {
          var results = response.results;
          results = $.map(results, function(result) { return {name: result.name.full_name } });
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
      name: 'candidates',
      prefetch: { // Prefetch 2000 Principal committees
        url: "js/data/committees_p.json",
        filter: function(response) {
          var results = response.results;
          results = $.map(results, function(result) { return {name: result.name } });
          return results;
        }
      },
      remote: {
        url: "/rest/committee?name=%QUERY",
        filter: function(response) {
          var results = response.results;
          results = $.map(results, function(result) { return {name: result.name } });
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
        header: Handlebars.compile('<h5>Candidates</h5>'),
      }
    },
    {
      name: 'Committees',
      displayKey: 'name',
      source: committeeEngine.ttAdapter(),
      templates: {
        header: Handlebars.compile('<h5>Committees</h5>'),
      }
    }
    )

    $('.twitter-typeahead').css({
      display: 'block',
    })
  }
}
