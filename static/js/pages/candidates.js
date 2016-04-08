'use strict';

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');
var columns = require('../modules/columns');

var candidatesTemplate = require('../../templates/candidates.hbs');

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
      afterRender: tables.modalRenderFactory(candidatesTemplate)
    }
  });
});
