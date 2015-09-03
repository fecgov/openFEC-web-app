'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var filings = require('../modules/filings');
var columns = require('../modules/columns');

var filingsColumns = columns.getColumns(
  columns.filings,
  [
    'pdf_url', 'filer_name', 'amendment_indicator', 'receipt_date', 'coverage_end_date',
    'total_receipts', 'total_disbursements', 'total_independent_expenditures',
    'modal_trigger'
  ]
);

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable($table, $form, 'filings', {}, filingsColumns,
    _.extend({}, tables.offsetCallbacks, {
      afterRender: filings.renderModal
    }),
    {
      rowCallback: filings.renderRow,
      // Order by receipt date descending
      order: [[3, 'desc']],
      useFilters: true
  });
});
