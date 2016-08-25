'use strict';

/* global require, document */

var $ = require('jquery');

var filings = require('../modules/filings');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');
var tables = require('../modules/tables');
var TableSwitcher = require('../modules/table-switcher').TableSwitcher;

var columns = columnHelpers.getColumns(
  columns.filings,
  [
    'filer_name', 'pdf_url', 'amendment_indicator', 'pages', 'receipt_date', 'modal_trigger'
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
    order: [[4, 'desc']],
    hideColumns: '.hide-processed',
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
      hideColumns: '.hide-processed',
      disableExport: false
    }
  }).init();
});
