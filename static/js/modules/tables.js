'use strict';

/* global require, module */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');
require('datatables');

function yearRange(first, last) {
  if (first === last) {
    return first;
  } else {
    return first.toString() + ' - ' + last.toString();
  }
}

module.exports = {
  init: function() {
    var draw;
    $('#results').dataTable({
      serverSide: true,
      searching: false,
      lengthChange: false,
      columns: [
        {
          data: 'name',
          render: function(data, type, row, meta) {
            var anchor = $('<a>');
            anchor.addClass('single-link');
            anchor.attr('title', data);
            anchor.attr('data-category', 'candidate');
            anchor.attr('href', '/candidate' + row.candidate_id);
            anchor.text(data);
            return anchor[0].outerHTML;
          }
        },
        {data: 'office_full'},
        {
          data: 'election_years',
          render: function(data, type, row, meta) {
            return yearRange(data[0], row.active_through);
          }
        },
        {data: 'party'},
        {data: 'state'},
        {data: 'district'},
      ],
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
            data: response.results
          });
        });
      }
    });
  }
};
