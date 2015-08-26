'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var decoders = require('../modules/decoders');

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
    data: 'amendment_indicator',
    className: 'min-desktop',
    render: function(data) {
      return decoders.amendments[data] || '';
    },
  },
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  tables.dateColumn({data: 'coverage_end_date', className: 'min-tablet', orderable: false}),
];

$(document).ready(function() {
  var $table = $('table[data-type="filing"]');
  var $form = $('#category-filters');
  var candidateId = $table.attr('data-candidate');
  var path = ['candidate', candidateId, 'filings'].join('/');
  tables.initTableDeferred($table, $form, path, {}, columns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[2, 'desc']],
  });
});
