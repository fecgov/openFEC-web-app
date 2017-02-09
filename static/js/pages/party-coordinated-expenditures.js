'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
//var helpers = require('../modules/helpers');
//var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');

//var electioneeringTemplate = require('../../templates/communication-costs.hbs');

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    title: 'Party coordinated expenditures',
    path: ['schedules', 'schedule_f'],
    columns: columns.partyCoordinatedExpenditures,
    rowCallback: tables.modalRenderRow,
    order: [[3, 'desc']],
    useFilters: true,
    rowCallback: tables.modalRenderRow
  });
});
