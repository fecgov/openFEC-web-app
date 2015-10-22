'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var decoders = require('../modules/decoders');

var filingsColumns = [
  tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  columns.amendmentIndicatorColumn,
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
];

var expendituresColumns = [
  tables.currencyColumn({data: 'total'}),
  tables.committeeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn
];

function initFilingsTable() {
  var $table = $('table[data-type="filing"]');
  var candidateId = $table.attr('data-candidate');
  var path = ['candidate', candidateId, 'filings'];
  tables.initTableDeferred($table, null, path, {}, filingsColumns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[2, 'desc']],
    dom: tables.simpleDOM,
    pagingType: 'simple',
    hideEmpty: true
  });
}

function initExpendituresTable() {
  var $table = $('table[data-type="independent-expenditure"]');
  var path = ['schedules', 'schedule_e', 'by_candidate'];
  var query = {
    candidate_id: $table.data('candidate'),
    cycle: $table.data('cycle')
  };
  tables.initTableDeferred($table, null, path, query, expendituresColumns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[0, 'desc']],
    dom: tables.simpleDOM,
    pagingType: 'simple',
    hideEmpty: true
  });
}

$(document).ready(function() {
  initFilingsTable();
  initExpendituresTable();
});
