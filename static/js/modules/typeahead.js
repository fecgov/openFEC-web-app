'use strict';

module.exports = {
  init: function() {
    var engine = new Bloodhound({
      name: 'candidates',
      prefetch: {
        url: "js/data/candidates_2012.json",
        filter: function(response) {
          var results = response.results;
          results = $.map(results, function(result) { return {name: result.name.full_name } });
          console.log('prefetch' + results);
          return results;
        }
      },
      remote: {
        url: "/rest/candidate?name=%QUERY",
        filter: function(response) {
          var results = response.results;
          results = $.map(results, function(result) { return {name: result.name.full_name } });
          console.log(results);
          return results;
        }
      },
      datumTokenizer: function(d) {
        var tokens = Bloodhound.tokenizers.whitespace(d.name);
        return tokens;
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    engine.initialize();

    $('.search-bar').typeahead({
      minLength: 3,
      highlight: true,
      hint: false
    },
    {
      displayKey: 'name',
      source: engine.ttAdapter()
    })

    $('.twitter-typeahead').css({
      display: 'block',
    })
  }
}
