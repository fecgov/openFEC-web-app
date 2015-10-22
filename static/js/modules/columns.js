'use strict';

/* global require, module */

var _ = require('underscore');

var tables = require('./tables');
var helpers = require('./helpers');
var decoders = require('./decoders');

var sizeInfo = {
  0: {limits: [0, 199.99], label: 'Under $200'},
  200: {limits: [200, 499.99], label: '$200—$499'},
  500: {limits: [500, 999.99], label: '$500—$999'},
  1000: {limits: [1000, 1999.99], label: '$1000—$1999'},
  2000: {limits: [2000, null], label: 'Over $2000'},
};

function getSizeParams(size) {
  var limits = sizeInfo[size].limits;
  var params = {is_individual: 'true'};
  if (limits[0] !== null) {
    params.min_amount = helpers.currency(limits[0]);
  }
  if (limits[1] !== null) {
    params.max_amount = helpers.currency(limits[1]);
  }
  return params;
}

var supportOpposeMap = {
  S: 'Support',
  O: 'Oppose',
};

var supportOpposeColumn = {
  data: 'support_oppose_indicator',
  render: function(data, type, row, meta) {
    return supportOpposeMap[data] || 'Unknown';
  }
};

var amendmentIndicatorColumn = {
  data: 'amendment_indicator',
  className: 'hide-panel min-desktop',
  render: function(data) {
    return decoders.amendments[data] || '';
  },
};

var filings = {
  pdf_url: tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  filer_name: {
    data: 'committee_id',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var cycle = tables.getCycle(row);
      if (row.candidate_name) {
        return tables.buildEntityLink(
          row.candidate_name,
          helpers.buildAppUrl(['candidate', row.candidate_id], cycle),
          'candidate'
        );
      } else if (row.committee_name) {
        return tables.buildEntityLink(
          row.committee_name,
          helpers.buildAppUrl(['committee', row.committee_id], cycle),
          'committee'
        );
      } else {
        return '';
      }
    },
  },
  amendment_indicator: amendmentIndicatorColumn,
  receipt_date: tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  coverage_end_date: tables.dateColumn({data: 'coverage_end_date', className: 'min-tablet hide-panel', orderable: false}),
  total_receipts: tables.currencyColumn({data: 'total_receipts', className: 'min-tablet hide-panel'}),
  total_disbursements: tables.currencyColumn({data: 'total_disbursements', className: 'min-tablet hide-panel'}),
  total_independent_expenditures: tables.currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet hide-panel'}),
  modal_trigger: {
    className: 'all u-no-padding',
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
  sizeInfo: sizeInfo,
  getColumns: getColumns,
  getSizeParams: getSizeParams,
  supportOpposeColumn: supportOpposeColumn,
  amendmentIndicatorColumn: amendmentIndicatorColumn
};
