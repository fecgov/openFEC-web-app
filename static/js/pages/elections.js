'use strict';

/* global require, window, document */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');

var tables = require('../modules/tables');

var comparisonTemplate = require('../../templates/comparison.hbs');

var columns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  {data: 'candidate_status_full', className: 'min-tablet'},
  tables.currencyColumn({data: 'total_receipts'}),
  tables.currencyColumn({data: 'total_disbursements'}),
  tables.currencyColumn({data: 'cash_on_hand_end_period'}),
  {
    data: 'pdf_url',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var anchor = document.createElement('a');
      anchor.textContent = row.document_description;
      anchor.setAttribute('href', data);
      anchor.setAttribute('target', '_blank');
      return anchor.outerHTML;
    }
  },
];

var sizeColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  tables.currencyColumn({data: '0'}),
  tables.currencyColumn({data: '200'}),
  tables.currencyColumn({data: '500'}),
  tables.currencyColumn({data: '1000'}),
  tables.currencyColumn({data: '2000'})
];

var typeColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  tables.currencyColumn({data: 'individual'}),
  tables.currencyColumn({data: 'committee'}),
];

var stateColumn = {'data': 'state'};
function stateColumns(results) {
  var columns = _.map(results, function(result) {
    return tables.currencyColumn({data: result.candidate_id});
  });
  return [stateColumn].concat(columns);
}

function drawComparison(results) {
  $('#comparison').html(comparisonTemplate(results));
}

$(document).ready(function() {
  var $table = $('#results');
  var query = URI.parseQuery(window.location.search);
  tables.initTable($table, null, 'elections', query, columns, tables.offsetCallbacks, {
    ordering: false,
    dom: '<"results-info meta-box results-info--top"lfrip>t',
    pagingType: 'simple',
    lengthChange: false,
    pageLength: 10
  });
  $table.on('xhr.dt', function(event, settings, json) {
    drawComparison(json.data);
  });
});
