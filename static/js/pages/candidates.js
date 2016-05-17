'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var columns = require('../modules/columns');
var tablePanels = require('../modules/table-panels');

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    title: 'Candidate',
    path: ['candidates'],
    columns: columns.candidates,
    useFilters: true,
    useExport: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: tablePanels.renderCandidatePanel(false)
    }
  });
});
