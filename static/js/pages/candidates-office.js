'use strict';

/* global context */

var $ = require('jquery');

var tables = require('../modules/tables');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var filterTags = require('fec-style/js/filter-tags');

var candidatesTemplate = require('../../templates/candidates-office.hbs');

var columnGroups = {
  president: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'receipts', 'disbursements', 'trigger']),
  senate: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'state', 'receipts', 'disbursements', 'trigger']),
  house: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'state', 'district', 'receipts', 'disbursements', 'trigger']),
};

$(document).ready(function() {
  var $table = $('#results');
  var $widgets = $(tables.dataWidgets);
  var $tagList = new filterTags.TagList({title: 'All records'}).$body;
  var filterPanel = new FilterPanel();

  new tables.DataTable($table, {
    title: 'Candidate',
    path: ['candidates', 'totals'],
    query: {office: context.office.slice(0, 1).toUpperCase()},
    panel: filterPanel,
    columns: columnGroups[context.office],
    useFilters: true,
    useExport: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: tables.modalRenderFactory(candidatesTemplate)
    }
  });
  $widgets.find('.js-filter-tags').prepend($tagList);
});
