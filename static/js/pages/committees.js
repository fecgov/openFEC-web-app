'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var committeesTemplate = require('../../templates/committees.hbs');

var columns = [
  {
    data: 'name',
    className: 'all',
    width: '280px',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/committee/' + row.committee_id + tables.buildCycle(row), 'committee');
    }
  },
  {data: 'treasurer_name', className: 'min-desktop hide-panel'},
  {data: 'state', className: 'min-desktop hide-panel', width: '60px'},
  {data: 'party_full', className: 'min-desktop hide-panel'},
  tables.dateColumn({data: 'first_file_date', className: 'min-tablet hide-panel'}),
  {data: 'committee_type_full', className: 'min-tablet hide-panel'},
  {data: 'designation_full', className: 'min-tablet hide-panel'},
  {data: 'organization_type_full', className: 'min-desktop hide-panel'},
  {
    className: 'all',
    width: '20px',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.MODAL_TRIGGER_HTML;
    }
  }
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable(
    $table,
    $form,
    'committees',
    {},
    columns,
    _.extend(tables.offsetCallbacks, {
      afterRender: tables.modalRenderFactory(committeesTemplate)
    }),
    {useFilters: true}
  );});
