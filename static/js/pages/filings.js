'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var filings = require('../modules/filings');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');
var tables = require('../modules/tables');
var TableSwitcher = require('../modules/table-switcher').TableSwitcher;

var columns = columnHelpers.getColumns(
  columns.filings,
  [
    'filer_name', 'pdf_url', 'amendment_indicator', 'receipt_date', 'coverage_start_date', 'coverage_end_date', 'modal_trigger'
  ]
);


$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    tableSwitcher: true,
    title: 'Filings',
    path: ['filings'],
    columns: columns,
    rowCallback: filings.renderRow,
    // Order by receipt date descending
    hideColumns: '.hide-processed',
    order: [[3, 'desc']],
    useFilters: true,
    useExport: true,
    callbacks: {
      afterRender: filings.renderModal
    }
  });

  new TableSwitcher('.js-table-switcher', {
    efiling: {
      path: ['efile', 'filings'],
      disableFilters: true,
      enabledFilters: ['committee_id', 'data_type', 'receipt_date'],
      hideColumns: '.hide-efiling',
      disableExport: true
    },
    processed: {
      path: ['filings'],
      disableFilters: false,
      hideColumns: '.hide-processed',
      disableExport: false
    }
  }).init();
});
