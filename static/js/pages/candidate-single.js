'use strict';

/* global require, document, context */

var $ = require('jquery');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');

var filingsColumns = [
  columnHelpers.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  columns.amendmentIndicatorColumn,
  columns.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
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
  columns.committeeColumn({data: 'committee', className: 'all'}),
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
  columns.committeeColumn({data: 'committee', className: 'all'}),
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
  columns.committeeColumn({data: 'committee', className: 'all'})
];

var individualContributionsColumns = [
  {
    data: 'contributor_name',
    className: 'all',
    orderable: false,
  },
  {
    data: 'committee',
    className: 'all',
    orderable: false,
    render: function(data, type, row) {
      return columnHelpers.buildEntityLink(
        row.committee.name,
        helpers.buildAppUrl(['committee', row.committee_id]),
        'committee'
      );
    }
  },
  columns.dateColumn({data: 'contribution_receipt_date', className: 'min-tablet'}),
  columns.currencyColumn({
    data: 'contribution_receipt_amount',
    className: 'column--number'
  }),
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
    title: 'independent expenditures'
  },
  'communication-costs': {
    path: ['communication_costs', 'by_candidate'],
    columns: communicationCostColumns,
    title: 'communication costs'
  },
  'electioneering': {
    path: ['electioneering', 'by_candidate'],
    columns: electioneeringColumns,
    title: 'electioneering communications'
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
        lengthChange: true,
        pageLength: 10,
        lengthMenu: [10, 50, 100],
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

function initContributionsTables() {
  var $table = $('table[data-type="individual-contributions"]');
  var path = ['schedules', 'schedule_a'];
  var opts = {
    // possibility of multiple committees, so split into array
    committee_id: $table.attr('data-committee-id').split(','),
    title: 'individual contributions',
    name: $table.data('name'),
    cycle: $table.data('cycle')
  };

  tables.DataTable.defer($table, {
    path: path,
    query: {
      committee_id: opts.committee_id,
      two_year_transaction_period: opts.cycle
    },
    columns: individualContributionsColumns,
    order: [[2, 'desc']],
    dom: tables.simpleDOM,
    aggregateExport: true,
    paginator: tables.SeekPaginator,
    useFilters: true,
    useExport: true,
    hideEmpty: true,
    hideEmptyOpts: {
      dataType: opts.title,
      name: opts.name,
      timePeriod: opts.cycle
    }
  });
}

$(document).ready(function() {
  initFilingsTable();
  initSpendingTables();
  initContributionsTables();
});
