'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var donationTemplate = require('../../templates/receipts.hbs');

var columns = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all',
    width: '27%',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return row.contributor_name;
      }
    }
  },
  {data: 'contributor_state', orderable: false, className: 'min-desktop hide-panel'},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop hide-panel'},
  tables.currencyColumn({data: 'contributor_receipt_amount', className: 'min-tablet'}),
  tables.dateColumn({data: 'contributor_receipt_date', 
      className: 'min-mobile hide-panel-tablet'}),
  {
    data: 'committee',
    orderable: false,
    className: 'all hide-panel',
    width: '27%',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return '';
      }
    }
  },
  {
    className: 'min-mobile',
    width: '4%',
    orderable: false,
    render: function(data, type, row, meta) {
      return '<i class="icon ti-angle-right"></i>';
    }
  }
];

$(document).ready(function() {
  var $table = $('#results');
  var $form = $('#category-filters');
  tables.initTable(
    $table,
    $form,
    'schedules/schedule_a',
    {},
    columns,
    _.extend(tables.seekCallbacks, {
      afterRender: tables.modalAfterRender.bind(undefined, donationTemplate)
    }),
    {
      order: [[4, 'desc']],
      pagingType: 'simple'
    }
  );
});
