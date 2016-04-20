'use strict';

/* global document */

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var columnHelpers = require('../modules/column-helpers');
var lookup = require('../modules/election-lookup');
var summary = require('../modules/election-summary');

var filingsColumns = columnHelpers.getColumns(
  columns.filings,
  ['pdf_url', 'filer_name', 'receipt_date']
);

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    path: 'filings',
    query: {per_page: 10},
    columns: filingsColumns,
    // Order by receipt date descending
    order: [[2, 'desc']],
    useFilters: false,
    dom: 't'
  });

  new lookup.ElectionLookupPreview('#election-preview');
  new summary.ElectionSummary('#election-summary', {cycle: 2016, office: 'president'});
});
