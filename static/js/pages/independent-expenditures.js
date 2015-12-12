'use strict';

/* global require, document */

var $ = require('jquery');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');
var columns = require('../modules/columns');
var FilterPanel = require('../modules/filter-panel').FilterPanel;

var columns = [
  {
    data: 'committee',
    orderable: false,
    className: 'min-desktop hide-panel',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(
          data.name,
          helpers.buildAppUrl(['committee', data.committee_id]),
          'committee'
        );
      } else {
        return '';
      }
    }
  },
  {data: 'expenditure_description', orderable: false, className: 'min-desktop hide-panel'},
  tables.currencyColumn({data: 'expenditure_amount', className: 'min-tablet'}),
  tables.dateColumn({data: 'expenditure_date', className: 'min-tablet hide-panel-tablet'}),
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-desktop hide-panel',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(
        data,
        helpers.buildAppUrl(['candidate', row.candidate_id], tables.getCycle(row, meta)),
        'candidate'
      );
    }
  },
  columns.supportOpposeColumn,
  {
    className: 'all u-no-padding',
    width: '20px',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.MODAL_TRIGGER_HTML;
    }
  }
];

$(document).ready(function() {
  var $table = $('#results');
  var filterPanel = new FilterPanel('#category-filters');
  new tables.DataTable($table, {
    path: 'schedules/schedule_e',
    panel: filterPanel,
    columns: columns,
    paginator: tables.SeekPaginator,
    rowCallback: tables.modalRenderRow,
    order: [[3, 'desc']],
    useFilters: true,
    callbacks: {
      // afterRender: tables.modalRenderFactory(donationTemplate)
    }
  });
});
