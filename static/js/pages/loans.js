'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    title: 'loans',
    path: ['schedules','schedule_c'],
    columns: columns.loans,
    order: [[2, 'desc']],
    useFilters: true,
    useExport: true,
    rowCallback: tables.modalRenderRow
  });
});