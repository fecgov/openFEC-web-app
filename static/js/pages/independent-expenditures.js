'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var TableSwitcher = require('../modules/table-switcher').TableSwitcher;

var expenditureTemplate = require('../../templates/independent-expenditures.hbs');

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    autoWidth: false,
    title: 'Independent expenditures',
    path: ['schedules', 'schedule_e'],
    columns: columns.independentExpenditures,
    paginator: tables.SeekPaginator,
    rowCallback: tables.modalRenderRow,
    useExport: true,
    order: [[5, 'desc']],
    useFilters: true,
    callbacks: {
      afterRender: tables.modalRenderFactory(expenditureTemplate)
    }
  });

  new TableSwitcher('.js-table-switcher', {
    summary: {
      path: ['schedules', 'schedule_e']
    },
    notice: {
      path: ['schedules', 'schedule_e', 'notice'],
      disableFilters: true,
      enabledFilters: ['committee_id', 'cycle', 'data_type', 'candidate_id',
                      'support_oppose_indicator', 'payee_name', 'min_amount',
                      'max_amount', 'date'],
    }
  }).init();
});
