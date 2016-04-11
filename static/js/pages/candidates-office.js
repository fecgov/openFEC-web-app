'use strict';

/* global context */

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var helpers = require('../modules/helpers');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var filterTags = require('fec-style/js/filter-tags');

var candidatesTemplate = require('../../templates/candidates-office.hbs');

var columnOptions = {
  name: {
    data: 'name',
    className: 'all',
    width: '280px',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(
        data,
        helpers.buildAppUrl(
          ['candidate', row.candidate_id],
          tables.getCycle(row.election_years, meta)
        ),
        'candidate'
      );
    }
  },
  party: {data: 'party_full', className: 'min-tablet hide-panel'},
  state: {data: 'state', className: 'min-desktop hide-panel'},
  district: {data: 'district', className: 'min-desktop hide-panel'},
  receipts: tables.currencyColumn({data: 'receipts', className: 'min-tablet'}),
  disbursements: tables.currencyColumn({data: 'disbursements', className: 'min-tablet'}),
  trigger: {
    className: 'all u-no-padding',
    width: '20px',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.MODAL_TRIGGER_HTML;
    }
  }
};

var columnGroups = {
  president: columns.getColumns(columnOptions, ['name', 'party', 'receipts', 'disbursements', 'trigger']),
  senate: columns.getColumns(columnOptions, ['name', 'party', 'state', 'receipts', 'disbursements', 'trigger']),
  house: columns.getColumns(columnOptions, ['name', 'party', 'state', 'district', 'receipts', 'disbursements', 'trigger']),
};

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    title: 'Candidate',
    path: ['candidates', 'totals'],
    query: {office: context.office.slice(0, 1).toUpperCase()},
    columns: columnGroups[context.office],
    useFilters: true,
    useExport: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: tables.modalRenderFactory(candidatesTemplate)
    }
  });
});
