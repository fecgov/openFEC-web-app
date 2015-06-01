'use strict';

/* global require, module */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');
require('datatables');

module.exports = {
  init: function() {
    var draw;
    $('#results').dataTable({
      serverSide: true,
      searching: false,
      lengthChange: false,
      ajax: function(data, callback, settings) {
        $.getJSON(
          URI('http://localhost:5000/v1/candidates')
          .query({
            per_page: data.length,
            page: Math.floor(data.start / data.length) + 1
          })
          .toString()
        ).done(function(response) {
          callback({
            recordsTotal: response.pagination.count,
            recordsFiltered: response.pagination.count,
            data: response.results.map(function(result) {
              return [
                result.name,
                result.office_full,
                result.election_years,
                result.party_full,
                result.state,
                result.district
              ];
            })
          });
        });
      }
    });
  }
};
