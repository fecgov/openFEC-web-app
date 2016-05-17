'use strict';

/* global context */

var $ = require('jquery');

var tables = require('../modules/tables');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');
var tablePanels = require('../modules/table-panels');

var columnGroups = {
  president: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'receipts', 'disbursements', 'trigger']),
  senate: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'state', 'receipts', 'disbursements', 'trigger']),
  house: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'state', 'district', 'receipts', 'disbursements', 'trigger']),
};

var defaultSort = {
  president: 2,
  senate: 3,
  house: 4
};

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    title: 'Candidates for ' + context.office,
    path: ['candidates', 'totals'],
    query: {office: context.office.slice(0, 1).toUpperCase()},
    columns: columnGroups[context.office],
    order: [[defaultSort[context.office], 'desc']],
    useFilters: true,
    useExport: true,
    disableExport: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: tablePanels.renderCandidatePanel(true)
    }
  });
});
