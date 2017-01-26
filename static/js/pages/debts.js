'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var tablePanels = require('../modules/table-panels');

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    title: 'Debts',
    path: ['debts'],
    columns: columns.debts,
    useFilters: true,
    useExport: true,
    rowCallback: tables.modalRenderRow
  });
});
