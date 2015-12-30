'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;

var candidatesTemplate = require('../../templates/candidates.hbs');

var columns = [
  {
    data: 'name',
    className: 'all',
    width: '280px',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(
        data,
        helpers.buildAppUrl(
          ['candidate', row.candidate_id],
          tables.getCycle(row.election_years, meta)
        ),
        'candidate'
      );
    }
  },
  {data: 'office_full', className: 'min-tablet hide-panel'},
  {
    data: 'election_years',
    className: 'min-tablet',
    render: function(data, type, row, meta) {
      return tables.yearRange(_.first(data), _.last(data));
    }
  },
  {data: 'party_full', className: 'min-tablet hide-panel'},
  {data: 'state', className: 'min-desktop hide-panel'},
  {data: 'district', className: 'min-desktop hide-panel'},
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
  var filterPanel = new FilterPanel();
  new tables.DataTable($table, {
    path: 'candidates',
    filterPanel: filterPanel,
    columns: columns,
    useFilters: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: tables.modalRenderFactory(candidatesTemplate)
    }
  });
});
