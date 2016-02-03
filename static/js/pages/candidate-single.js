'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');

var filingsColumns = [
  tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  columns.amendmentIndicatorColumn,
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
];

var expendituresColumns = [
  {
    data: 'total',
    className: 'all',
    orderable: true,
    orderSequence: ['desc', 'asc'],
    render: tables.buildTotalLink(['independent-expenditures'], function(data, type, row, meta) {
        return {
          support_oppose_indicator: row.support_oppose_indicator,
          candidate_id: row.candidate_id
        };
    })
  },
  tables.committeeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn
];

function initFilingsTable() {
  var $table = $('table[data-type="filing"]');
  var candidateId = $table.attr('data-candidate');
  var path = ['candidate', candidateId, 'filings'];
  tables.DataTable.defer($table, {
    path: path,
    columns: filingsColumns,
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
    cycle: $table.data('cycle'),
    election_full: $table.data('election-full')
  };
  tables.DataTable.defer($table, {
    path: path,
    query: query,
    columns: expendituresColumns,
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
