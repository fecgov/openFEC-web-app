'use strict';

/* global require, document, context */

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var columnHelpers = require('../modules/column-helpers');

var candidateTemplate = require('../../templates/reports/candidate.hbs');
var pacPartyTemplate = require('../../templates/reports/pac.hbs');
var ieOnlyTemplate = require('../../templates/reports/ie-only.hbs');

var pageTitle,
    pageTemplate,
    pageColumns,
    columnKeys = ['committee', 'pdf_url', 'coverage_end_date'];

if (context.reportType === 'presidential') {
  pageTitle = 'Presidential committee reports';
  pageTemplate = candidateTemplate;
  columnKeys.push('receipts', 'disbursements', 'trigger');
} else if (context.reportType === 'house-senate') {
  pageTitle = 'House and Senate committee reports';
  pageTemplate = candidateTemplate;
  columnKeys.push('receipts', 'disbursements', 'trigger');
} else if (context.reportType === 'pac-party') {
  pageTitle = 'PAC and party committee reports';
  pageTemplate = pacPartyTemplate;
  columnKeys.push('receipts', 'disbursements', 'independentExpenditures', 'trigger');
} else if (context.reportType === 'ie-only') {
  pageTitle = 'Independent expenditure-only committee reports';
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
    title: pageTitle,
    path: ['reports', context.reportType],
    query: [{is_amended: false}],
    columns: pageColumns,
    rowCallback: tables.modalRenderRow,
    // Order by coverage date descending
    order: [[2, 'desc']],
    useFilters: true,
    useExport: true,
    disableExport: true,
    callbacks: {
      afterRender: tables.modalRenderFactory(pageTemplate)
    }
  });
});
