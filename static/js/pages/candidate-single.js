'use strict';

/* global require, document, context */

var $ = require('jquery');

var tables = require('../modules/tables');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');

var filingsColumns = [
  columnHelpers.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  columns.amendmentIndicatorColumn,
  columns.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
];

var expenditureColumns = [
  columns.committeeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn,
  {
    data: 'total',
    className: 'all column--number',
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
];

var communicationCostColumns = [
  columns.committeeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn,
  {
    data: 'total',
    className: 'all column--number',
    orderable: true,
    orderSequence: ['desc', 'asc'],
    render: columnHelpers.buildTotalLink(['communication-costs'], function(data, type, row, meta) {
        return {
          support_oppose_indicator: row.support_oppose_indicator,
          candidate_id: row.candidate_id,
        };
    })
  }
];

var electioneeringColumns = [
  columns.committeeColumn({data: 'committee', className: 'all'}),
  {
    data: 'total',
    className: 'all column--number',
    orderable: true,
    orderSequence: ['desc', 'asc'],
    render: columnHelpers.buildTotalLink(['electioneering-communications'], function(data, type, row, meta) {
        return {candidate_id: row.candidate_id};
    })
  }
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
    columns: expenditureColumns,
    title: 'independent expenditures',
    order: [[2, 'desc']]
  },
  'communication-costs': {
    path: ['communication_costs', 'by_candidate'],
    columns: communicationCostColumns,
    title: 'communication costs',
    order: [[2, 'desc']]
  },
  'electioneering': {
    path: ['electioneering', 'by_candidate'],
    columns: electioneeringColumns,
    title: 'electioneering communications',
    order: [[1, 'desc']]
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
        order: opts.order,
        dom: tables.simpleDOM,
        pagingType: 'simple',
        lengthChange: false,
        pageLength: 10,
        hideEmpty: true,
        hideEmptyOpts: {
          dataType: opts.title,
          name: context.name,
          timePeriod: context.timePeriod
        }
      });
    }
  });
}

$(document).ready(function() {
  initFilingsTable();
  initSpendingTables();
});
