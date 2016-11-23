'use strict';

/* global require, document, context */

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var columnHelpers = require('../modules/column-helpers');
var TableSwitcher = require('../modules/table-switcher').TableSwitcher;
var dropdown = require('fec-style/js/dropdowns');

var candidateTemplate = require('../../templates/reports/candidate.hbs');
var pacPartyTemplate = require('../../templates/reports/pac.hbs');
var ieOnlyTemplate = require('../../templates/reports/ie-only.hbs');

var pageTitle,
    pageTemplate,
    pageColumns,
    columnKeys = ['committee', 'document_type', 'receipt_date', 'coverage_end_date'];

if (context.form_type === 'presidential') {
  pageTitle = 'Presidential committee reports';
  pageTemplate = candidateTemplate;
  columnKeys.push('receipts', 'disbursements', 'trigger');
} else if (context.form_type === 'house-senate') {
  pageTitle = 'House and Senate committee reports';
  pageTemplate = candidateTemplate;
  columnKeys.push('receipts', 'disbursements', 'trigger');
} else if (context.form_type === 'pac-party') {
  pageTitle = 'PAC and party committee reports';
  pageTemplate = pacPartyTemplate;
  columnKeys.push('receipts', 'disbursements', 'independentExpenditures', 'trigger');
} else if (context.form_type === 'ie-only') {
  pageTitle = 'Independent expenditure only committee reports';
  pageTemplate = ieOnlyTemplate;
  columnKeys.push('contributions', 'independentExpenditures', 'trigger');
}

pageColumns = columnHelpers.getColumns(
  columns.reports,
  columnKeys
);

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    tableSwitcher: true,
    title: pageTitle,
    path: ['reports', context.form_type],
    columns: pageColumns,
    rowCallback: tables.modalRenderRow,
    // Order by coverage date descending
    order: [[2, 'desc']],
    useFilters: true,
    useExport: true,
    callbacks: {
      afterRender: tables.modalRenderFactory(pageTemplate)
    },
    drawCallback: function () {
      this.dropdowns = $table.find('.dropdown').map(function(idx, elm) {
        return new dropdown.Dropdown($(elm), {checkboxes: false});
      });
    }
  });

  new TableSwitcher('.js-table-switcher', {
    efiling: {
      path: ['efile', 'reports', context.form_type],
      disableFilters: true,
      enabledFilters: ['committee_id', 'data_type', 'receipt_date']
    },
    processed: {
      path: ['reports', context.form_type]
    }
  }).init();
});
