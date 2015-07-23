'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');

var columns = [
  {
    data: 'pdf_url',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var anchor = document.createElement('a');
      anchor.textContent = 'View filing';
      anchor.setAttribute('href', data);
      anchor.setAttribute('target', '_blank');
      return anchor.outerHTML;
    }
  },
  {data: 'committee_name', className: 'min-desktop', orderable: false},
  {data: 'candidate_name', className: 'min-desktop', orderable: false},
  {data: 'amendment_indicator', className: 'min-desktop'},
  {data: 'report_type_full', className: 'min-desktop', orderable: false},
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_receipts', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_disbursements', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'})
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable($table, $form, 'filings', {}, columns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[5, 'desc']],
  });
});
