'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var filings = require('../modules/filings');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');

var filingsColumns = columnHelpers.getColumns(
  columns.filings,
  [
    'filer_name', 'pdf_url', 'amendment_indicator', 'receipt_date', 'coverage_end_date',
    'total_receipts', 'total_disbursements', 'modal_trigger'
  ]
);

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    title: 'Filings',
    path: ['filings'],
    columns: filingsColumns,
    rowCallback: filings.renderRow,
    // Order by receipt date descending
    order: [[3, 'desc']],
    useFilters: true,
    useExport: true,
    callbacks: {
      afterRender: filings.renderModal
    }
  });
});
