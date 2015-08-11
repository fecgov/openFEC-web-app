'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');

var columns = [
  {
    data: 'document_description',
    className: 'all',
    orderable: false,
    width: '20%',
    render: function(data, type, row, meta) {
      var anchor = document.createElement('a');
      anchor.textContent = data;
      anchor.setAttribute('href', row.pdf_url);
      anchor.setAttribute('target', '_blank');
      return anchor.outerHTML;
    }
  },
  {data: 'committee_name', className: 'min-desktop', orderable: false},
  {data: 'candidate_name', className: 'min-desktop', orderable: false},
  {data: 'amendment_indicator', className: 'min-desktop'},
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  // this would be better as a range of dates, with the title "Coverage Period"
  tables.dateColumn({data: 'coverage_end_date', className: 'min-tablet', orderable: false}),
  tables.currencyColumn({data: 'total_receipts', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_disbursements', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'})
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable($table, $form, 'filings', {}, columns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[4, 'desc']],
  });
});
