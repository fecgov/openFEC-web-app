'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');

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
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet', orderable: false}),
];

$(document).ready(function() {
  var $table = $('#results');
  tables.initTable($table, null, 'filings', {per_page: 10}, columns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[2, 'desc']],
    useFilters: false,
    dom: 't'
  });
});
