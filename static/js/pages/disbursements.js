'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var disbursementTemplate = require('../../templates/expenditure.hbs');

var columns = [
  {
    width: '5%',
    render: function(data, type, row, meta) {
      return '<span class="modal-toggle">+</span>';
    }
  },
  {
    data: 'recipient_name',
    orderable: false,
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      var committee = row.recipient_committee;
      if (committee) {
        return tables.buildEntityLink(committee.name, '/committee/' + committee.committee_id, 'committee');
      } else {
        return data;
      }
    }
  },
  {data: 'recipient_state', orderable: false, className: 'min-desktop'},
  tables.currencyColumn({data: 'disbursement_amount', className: 'min-tablet'}),
  tables.dateColumn({data: 'disbursement_date', className: 'min-tablet'}),
  {data: 'disbursement_description', className: 'min-tablet', orderable: false},
  {
    data: 'committee',
    orderable: false,
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return '';
      }
    }
  },
];

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
    order: [[4, 'desc']],
    pagingType: 'simple'
  }
);
