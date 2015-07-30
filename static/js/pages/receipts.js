'use strict';

/* global require, document */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var typeahead = require('../modules/typeahead');
var donationTemplate = require('../../templates/donation.hbs');

var columns = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return row.contributor_name;
      }
    }
  },
  {data: 'contributor_state', orderable: false, className: 'min-desktop'},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop'},
  tables.currencyColumn({data: 'contributor_receipt_amount', className: 'min-tablet'}),
  tables.dateColumn({data: 'contributor_receipt_date', className: 'min-tablet'}),
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
  {
    width: '5%',
    orderable: false,
    render: function(data, type, row, meta) {
      return '';
    }
  }
];

$(document).ready(function() {

  // Set up data table
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

  // Set up committee typeahead
  var $committeeFilter = $('#committee-typeahead-filter');
  var $committeeInput = $('input[name="committee_id"]');
  $committeeFilter.typeahead({}, typeahead.committeeDataSet);
  $committeeFilter.on('typeahead:selected', function(event, datum, datasetName) {
    $committeeInput.val(datum.id);
  });

  // Set up date picker
  var $field = $('#file-date');
  var $minDate = $field.find('[name="min_date"]');
  var $maxDate = $field.find('[name="max_date"]');
  $field.on('click', '[name="_file_date"]', function(e) {
    var $input = $(e.target);
    if ($input.attr('data-min-date')) {
      $minDate.val($input.attr('data-min-date'));
      $maxDate.val($input.attr('data-max-date'));
    }
    $minDate.focus();
  });
});
