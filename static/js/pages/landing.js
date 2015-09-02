'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');

var filingsColumns = columns.getColumns(
  columns.filings,
  ['pdf_url', 'committee_name', 'candidate_name', 'receipt_date']
);

$(document).ready(function() {
  var $table = $('#results');
  tables.initTable($table, null, 'filings', {per_page: 10}, filingsColumns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[3, 'desc']],
    useFilters: false,
    dom: 't'
  });
});
