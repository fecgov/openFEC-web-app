'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var candidatesTemplate = require('../../templates/candidates.hbs');

var columns = [
  {
    data: 'name',
    className: 'all',
    width: '300px',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id + tables.buildCycle(row), 'candidate');
    }
  },
  {data: 'office_full', className: 'min-tablet hide-panel'},
  {
    data: 'cycles',
    className: 'min-tablet',
    render: function(data, type, row, meta) {
      return tables.yearRange(_.first(data), _.last(data));
    }
  },
  {data: 'party_full', className: 'min-tablet hide-panel'},
  {data: 'state', className: 'min-desktop hide-panel'},
  {data: 'district', className: 'min-desktop hide-panel'},
  {
    className: 'all',
    width: '20px',
    orderable: false,
    render: function(data, type, row, meta) {
      return '<i class="icon arrow--right"></i>';
    }
  }
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable(
    $table,
    $form,
    'candidates',
    {},
    columns,
    _.extend(tables.offsetCallbacks, {
      afterRender: tables.modalAfterRender.bind(undefined, candidatesTemplate)
    }),
    {useFilters: true}
  );
});
