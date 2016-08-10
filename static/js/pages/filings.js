'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var filings = require('../modules/filings');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');
var TableSwitcher = require('../modules/table-switcher').TableSwitcher;

var filingsColumns = columnHelpers.getColumns(
  columns.filings,
  [
    'filer_name', 'pdf_url', 'amendment_indicator', 'receipt_date', 'coverage_end_date',
    'total_receipts', 'total_disbursements', 'modal_trigger'
  ]
);

var efilingColumns = columnHelpers.getColumns(
  columns.filings,
  ['filer_name', 'pdf_url', 'receipt_date']);

var sharedOpts = {
  autoWidth: false,
  title: 'Filings',
 rowCallback: filings.renderRow,
  // Order by receipt date descending
  order: [[3, 'desc']],
  useFilters: true,
  useExport: true,
  efiling: {
    columns: efilingColumns,
    path: ['efile', 'filings']
  },
  processed: {
    path: ['filings'],
    columns: filingsColumns,
  },
  callbacks: {
    afterRender: filings.renderModal
  }
};

var efileOpts = _.extend({}, sharedOpts, {
  title: 'Filings (e-filings)',
  path: ['efile','filings'],
  columns: efilingColumns
});

var processedOpts = _.extend({}, sharedOpts, {
  title: 'Filings (processed)',
  path: ['filings'],
  columns: filingsColumns,
});

$(document).ready(function() {
  new TableSwitcher('.data-container__body', '.js-table-switcher', processedOpts, efileOpts).init();
});
