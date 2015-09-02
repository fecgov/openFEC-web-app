'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var decoders = require('../modules/decoders');

var columns = [
  tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  {
    data: 'committee_id',
    className: 'min-desktop',
    orderable: false,
    render: function(data, type, row, meta) {
      var cycle = tables.buildCycle(row);
      if (row.candidate_name) {
        return tables.buildEntityLink(row.candidate_name, '/candidate/' + row.candidate_id + cycle, 'candidate');
      } else if (row.committee_name) {
        return tables.buildEntityLink(row.committee_name, '/committee/' + row.candidate_id + cycle, 'committee');
      } else {
        return '';
      }
    },
  },
  {
    data: 'amendment_indicator',
    className: 'min-desktop',
    render: function(data, type, row, meta) {
      return decoders.amendments[data] || '';
    },
  },
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  // this would be better as a range of dates, with the title "Coverage Period"
  tables.dateColumn({data: 'coverage_end_date', className: 'min-tablet', orderable: false}),
  tables.currencyColumn({data: 'total_receipts', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_disbursements', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'})
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable($table, $form, 'filings', {}, columns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[3, 'desc']],
    useFilters: true
  });
});
