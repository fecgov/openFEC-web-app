'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var filings = require('../modules/filings');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');
var tables = require('../modules/tables');
var TableSwitcher = require('../modules/table-switcher').TableSwitcher;

var filingsColumns = columnHelpers.getColumns(
  columns.filings,
  [
    'filer_name', 'pdf_url', 'amendment_indicator', 'receipt_date', 'coverage_start_date', 'coverage_end_date', 'modal_trigger'
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

  new TableSwitcher('.js-table-switcher', {
    efiling: {
      path: ['efile', 'filings'],
      disableFilters: true,
      enabledFilters: ['committee_id', 'data_type']
    }, 
    processed: {
      path: ['filings'],
      disableFilters: false,
    }
  });
});
