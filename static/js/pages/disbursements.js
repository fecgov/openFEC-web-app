'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var disbursementTemplate = require('../../templates/disbursements.hbs');

var columns = [
  {
    data: 'recipient_name',
    orderable: false,
    className: 'all',
    width: '300px',
    render: function(data, type, row, meta) {
      var committee = row.recipient_committee;
      if (committee) {
        return tables.buildEntityLink(committee.name, '/committee/' + committee.committee_id, 'committee');
      } else {
        return data;
      }
    }
  },
  {data: 'recipient_state', orderable: false, className: 'min-desktop hide-panel'},
  tables.currencyColumn({data: 'disbursement_amount', className: 'min-tablet'}),
  tables.dateColumn({data: 'disbursement_date', className: 'min-tablet'}),
  {data: 'disbursement_description', className: 'min-desktop hide-panel', orderable: false},
  {
    data: 'committee',
    orderable: false,
    className: 'min-tablet hide-panel',
    width: '30%',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return '';
      }
    }
  },
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
    'schedules/schedule_b',
    {},
    columns,
    _.extend(tables.seekCallbacks, {
      afterRender: tables.modalAfterRender.bind(undefined, disbursementTemplate)
    }),
    {
      order: [[3, 'desc']],
      pagingType: 'simple',
      useFilters: true
    }
  );
});
