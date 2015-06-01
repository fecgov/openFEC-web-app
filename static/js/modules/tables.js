'use strict';

/* global require, module, API_LOCATION, API_VERSION, API_KEY */

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

var parsedFilters;

function buildCycle(datum) {
  if (parsedFilters.cycle) {
    var cycles = _.intersection(
      _.map(parsedFilters.cycle, function(cycle) {return parseInt(cycle);}),
      datum.cycles
    );
    return '?cycle=' + _.max(cycles);
  } else {
    return '';
  }
}

var candidateColumns = [
  {
    data: 'name',
    render: function(data, type, row, meta) {
      var anchor = $('<a>');
      anchor.addClass('single-link');
      anchor.attr('title', data);
      anchor.attr('data-category', 'candidate');
      anchor.attr('href', '/candidate/' + row.candidate_id + buildCycle(row));
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
];

var committeeColumns = [
  {
    data: 'name',
    render: function(data, type, row, meta) {
      var anchor = $('<a>');
      anchor.addClass('single-link');
      anchor.attr('title', data);
      anchor.attr('data-category', 'committee');
      anchor.attr('href', '/committee/' + row.committee_id + buildCycle(row));
      anchor.text(data);
      return anchor[0].outerHTML;
    }
  },
  {data: 'treasurer_name'},
  {data: 'state'},
  {data: 'party_full'},
  {data: 'organization_type_full'},
  {data: 'committee_type_full'},
  {data: 'designation_full'}
];

function initTable(table, form, baseUrl, columns) {
  var draw;
  var api = table.DataTable({
    serverSide: true,
    searching: false,
    pageLength: 30,
    lengthChange: false,
    columns: columns,
    dom: 'lfriptip',
    ajax: function(data, callback, settings) {
      var api = this.api();
      var filters = form.serializeArray();
      parsedFilters = prepareQuery(filters);
      var query = $.extend(
        {
          per_page: data.length,
          page: Math.floor(data.start / data.length) + 1,
          api_key: API_KEY
        },
        parsedFilters
      );
      if (data.order.length) {
        query.sort = _.map(data.order, function(order) {
          var name = columns[order.column].data;
          if (order.dir === 'desc') {
            name = '-' + name;
          }
          return name;
        });
      }
      $.getJSON(
        URI(API_LOCATION)
        .path([API_VERSION, baseUrl].join('/'))
        .query(query)
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
  form.submit(function(event) {
    event.preventDefault();
    api.ajax.reload();
  });
}

module.exports = {
  init: function() {
    var table = $('#results');
    var form = $('#category-filters');
    if (table.attr('data-type') === 'candidate') {
      initTable(table, form, 'candidates', candidateColumns);
    } else {
      initTable(table, form, 'committees', committeeColumns);
    }
  }
};
