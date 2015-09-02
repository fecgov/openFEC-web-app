'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');
var decoders = require('../modules/decoders');

var filingsTemplate = require('../../templates/filings.hbs');

var columns = [
  tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
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
  {
    data: 'amendment_indicator',
    className: 'min-desktop',
    render: function(data, type, row, meta) {
      return decoders.amendments[data] || '';
    },
  },
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  // this would be better as a range of dates, with the title "Coverage Period"
  tables.dateColumn({data: 'coverage_end_date', className: 'min-tablet', orderable: false}),
  tables.currencyColumn({data: 'total_receipts', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_disbursements', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'}),
  {
    className: 'all',
    width: '20px',
    orderable: false,
    render: function(data, type, row, meta) {
      return row.form_type && row.form_type.match(/^F3/) ?
        tables.MODAL_TRIGGER_HTML :
        '';
    }
  }
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable($table, $form, 'filings', {}, columns,
    _.extend({}, tables.offsetCallbacks, {
      afterRender: tables.modalRenderFactory(
        filingsTemplate,
        function(row) {
          var url = helpers.buildUrl(
            ['committee', row.committee_id, 'reports'],
            {beginning_image_number: row.beginning_image_number}
          );
          return $.getJSON(url).then(function(response) {
            var result = response.results.length ?
              response.results[0] :
              {};
            return _.extend({}, row, result);
          });
        }
      )
    }),
    {
      // Order by receipt date descending
      order: [[4, 'desc']],
      useFilters: true
  });
});
