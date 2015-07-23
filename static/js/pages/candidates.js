'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');

var columns = [
  {
    data: 'name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id + tables.buildCycle(row), 'candidate');
    }
  },
  {data: 'office_full', className: 'min-tablet'},
  {
    data: 'cycles',
    className: 'min-tablet',
    render: function(data, type, row, meta) {
      return tables.yearRange(_.first(data), _.last(data));
    }
  },
  {data: 'party_full', className: 'min-tablet'},
  {data: 'state', className: 'min-desktop'},
  {data: 'district', className: 'min-desktop'},
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable($table, $form, 'candidates', {}, columns, tables.offsetCallbacks, {useFilters: true});
});
