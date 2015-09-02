'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var decoders = require('../modules/decoders');

var columns = [
  tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  {
    data: 'amendment_indicator',
    className: 'min-desktop',
    render: function(data) {
      return decoders.amendments[data] || '';
    },
  },
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
];

$(document).ready(function() {
  var $table = $('table[data-type="filing"]');
  var $form = $('#category-filters');
  var candidateId = $table.attr('data-candidate');
  var path = ['candidate', candidateId, 'filings'].join('/');
  tables.initTableDeferred($table, $form, path, {}, columns, tables.offsetCallbacks, {
    // Order by receipt date descending
    order: [[2, 'desc']],
    dom: tables.simpleDOM,
  });
});
