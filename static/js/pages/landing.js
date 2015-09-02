'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');

var columns = [
  {
    data: 'document_description',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var anchor = document.createElement('a');
      anchor.textContent = data;
      anchor.setAttribute('href', row.pdf_url);
      anchor.setAttribute('target', '_blank');
      return anchor.outerHTML;
    }
  },
  {
    data: 'committee_name',
    className: 'min-desktop',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/committee/' + row.committee_id + tables.buildCycle(row), 'committee');
    },
  },
  {
    data: 'candidate_name',
    className: 'min-desktop',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id + tables.buildCycle(row), 'candidate');
    },
  },
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet', orderable: false}),
];

$(document).ready(function() {
  var $table = $('#results');
  tables.initTable($table, null, 'filings', {per_page: 10}, columns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[3, 'desc']],
    useFilters: false,
    dom: 't'
  });
  });
