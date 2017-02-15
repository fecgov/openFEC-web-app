'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');

var partyTemplate = require('../../templates/party-expenditures.hbs');

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    title: 'Party coordinated expenditures',
    path: ['schedules', 'schedule_f'],
    columns: columns.partyExpenditures,
    paginator: tables.SeekPaginator,
    rowCallback: tables.modalRenderRow,
    useExport: true,
    order: [[2, 'desc']],
    useFilters: true,
    callbacks: {
      afterRender: tables.modalRenderFactory(partyTemplate)
    }
  });
});
