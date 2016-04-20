'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var filterTags = require('fec-style/js/filter-tags');

var electioneeringTemplate = require('../../templates/electioneering-communications.hbs');

$(document).ready(function() {
  var $table = $('#results');
  var $widgets = $(tables.dataWidgets);
  var $tagList = new filterTags.TagList({title: 'All records'}).$body;
  var filterPanel = new FilterPanel('#category-filters');
  new tables.DataTable($table, {
    title: 'Electioneering communications',
    path: ['electioneering'],
    panel: filterPanel,
    columns: columns.electioneeringCommunications,
    rowCallback: tables.modalRenderRow,
    useExport: true,
    order: [[3, 'desc']],
    useFilters: true,
    callbacks: {
      afterRender: tables.modalRenderFactory(electioneeringTemplate)
    }
  });
  $widgets.find('.js-filter-tags').prepend($tagList);
});
