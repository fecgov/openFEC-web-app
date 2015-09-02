'use strict';

/* global require, module */

var _ = require('underscore');

var tables = require('./tables');
var decoders = require('./decoders');

var filings = {
  pdf_url: tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  committee_name: {
    data: 'committee_name',
    className: 'min-desktop',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/committee/' + row.committee_id + tables.buildCycle(row), 'committee');
    },
  },
  candidate_name: {
    data: 'candidate_name',
    className: 'min-desktop',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id + tables.buildCycle(row), 'candidate');
    },
  },
  amendment_indicator: {
    data: 'amendment_indicator',
    className: 'min-desktop',
    render: function(data, type, row, meta) {
      return decoders.amendments[data] || '';
    },
  },
  receipt_date: tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  coverage_end_date: tables.dateColumn({data: 'coverage_end_date', className: 'min-tablet hide-panel', orderable: false}),
  total_receipts: tables.currencyColumn({data: 'total_receipts', className: 'min-tablet hide-panel'}),
  total_disbursements: tables.currencyColumn({data: 'total_disbursements', className: 'min-tablet hide-panel'}),
  total_independent_expenditures: tables.currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet hide-panel'}),
  modal_trigger: {
    className: 'all',
    width: '20px',
    orderable: false,
    render: function(data, type, row, meta) {
      return row.form_type && row.form_type.match(/^F3/) ?
        tables.MODAL_TRIGGER_HTML :
        '';
    }
  }
};

function getColumns (columns, keys) {
  return _.map(keys, function(key) {
    return columns[key];
  });
}

module.exports = {
  filings: filings,
  getColumns: getColumns
};
