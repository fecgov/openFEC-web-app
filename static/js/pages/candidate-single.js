'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');

var filingsColumns = [
  columnHelpers.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  columns.amendmentIndicatorColumn,
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
];

var expenditureColumns = [
  {
    data: 'total',
    className: 'all',
    orderable: true,
    orderSequence: ['desc', 'asc'],
    render: columnHelpers.buildTotalLink(['independent-expenditures'], function(data, type, row, meta) {
        return {
          support_oppose_indicator: row.support_oppose_indicator,
          candidate_id: row.candidate_id,
          // is_notice: false,
        };
    })
  },
  columns.commiteeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn
];

var communicationCostColumns = [
  {
    data: 'total',
    className: 'all',
    orderable: true,
    orderSequence: ['desc', 'asc'],
    render: columnHelpers.buildTotalLink(['communication-costs'], function(data, type, row, meta) {
        return {
          support_oppose_indicator: row.support_oppose_indicator,
          candidate_id: row.candidate_id,
        };
    })
  },
  columns.commiteeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn
];

var electioneeringColumns = [
  {
    data: 'total',
    className: 'all',
    orderable: true,
    orderSequence: ['desc', 'asc'],
    render: columnHelpers.buildTotalLink(['electioneering-communications'], function(data, type, row, meta) {
        return {candidate_id: row.candidate_id};
    })
  },
  columns.commiteeColumn({data: 'committee', className: 'all'})
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

var tableOpts = {
  'independent-expenditures': {
    path: ['schedules', 'schedule_e', 'by_candidate'],
    columns: expenditureColumns
  },
  'communication-costs': {
    path: ['communication_costs', 'by_candidate'],
    columns: communicationCostColumns
  },
  'electioneering': {
    path: ['electioneering', 'by_candidate'],
    columns: electioneeringColumns
  },
};

function initSpendingTables() {
  $('.data-table').each(function(index, table) {
    var $table = $(table);
    var dataType = $table.attr('data-type');
    var opts = tableOpts[dataType];
    var query = {
      candidate_id: $table.data('candidate'),
      cycle: $table.data('cycle'),
      election_full: $table.data('election-full')
    };
    if (opts) {
      tables.DataTable.defer($table, {
        path: opts.path,
        query: query,
        columns: opts.columns,
        order: [[0, 'desc']],
        dom: tables.simpleDOM,
        pagingType: 'simple',
        lengthChange: false,
        pageLength: 10,
        hideEmpty: true
      });
    }
  });
}

$(document).ready(function() {
  initFilingsTable();
  initSpendingTables();
});
