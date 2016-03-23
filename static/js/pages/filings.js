'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var filings = require('../modules/filings');
var columns = require('../modules/columns');

var filingsColumns = columns.getColumns(
  columns.filings,
  [
    'pdf_url', 'filer_name', 'amendment_indicator', 'receipt_date', 'coverage_end_date',
    'total_receipts', 'total_disbursements', 'modal_trigger'
  ]
);

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    title: 'Filing',
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
