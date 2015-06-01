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

function prepareQuery(query) {
  return _.reduce(query, function(acc, val) {
    if (val.value) {
      if (acc[val.name]) {
        acc[val.name].push(val.value);
      } else {
        acc[val.name] = [val.value];
      }
    }
    return acc;
  }, {});
}

module.exports = {
  init: function() {
    var draw;
    var table = $('#results').DataTable({
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
        var api = this.api();
        var filters = $('#category-filters').serializeArray();
        $.getJSON(
          URI('http://localhost:5000/v1/candidates')
          .query(
            $.extend(
              {
                per_page: data.length,
                page: Math.floor(data.start / data.length) + 1
              },
              prepareQuery(filters)
            )
          )
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
    $('#category-filters').submit(function(event) {
      event.preventDefault();
      table.ajax.reload();
    })
  }
};
