'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var helpers = require('../modules/helpers');

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    title: 'Itemized loans',
    path: ['schedules','schedule_c'],
    //path: ['loans', 'get_schedules_schedule_c'],
    //path:['party-coordinated_expenditures','get_schedules_schedule_c'],
    columns: columns.itemizedLoans,
    order: [[2, 'desc']],
    useFilters: true,
    useExport: true,
    rowCallback: tables.modalRenderRow
  });
});