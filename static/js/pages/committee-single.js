'use strict';

/* global require, document */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');

var events = require('../modules/events');
var tables = require('../modules/tables');
var helpers = require('../modules/helpers');

var singlePageTableDOM = 't<"results-info results-info--bottom meta-box"frip>';

var committeeColumns = [
  {
    data: 'contributor_name',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/committee/' + row.contributor_id, 'committee');
    }
  },
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var uri = URI('/receipts')
        .query({
          committee_id: row.committee_id,
          contributor_id: row.contributor_id,
        });
      return tables.buildAggregateLink(data, uri, row.cycle);
    }
  }
];

var stateColumns = [
  {
    data: 'state_full',
    width: '50%',
    className: 'all',
    render: function(data, type, row, meta) {
      var span = document.createElement('span');
      span.textContent = data;
      span.setAttribute('data-state', data);
      span.setAttribute('data-row', meta.row);
      return span.outerHTML;
    }
  },
  {
    data: 'total',
    width: '50%',
    className: 'all',
    render: function(data, type, row, meta) {
      var span = document.createElement('div');
      span.setAttribute('data-value', data);
      span.setAttribute('data-row', meta.row);
      var link = document.createElement('a');
      link.textContent = helpers.currency(data);
      link.setAttribute('title', 'View individual transactions');
      var uri = URI('/receipts')
        .query({
          committee_id: row.committee_id,
          contributor_state: row.state
        });
      link.setAttribute('href', tables.buildAggregateUrl(uri, row.cycle));
      span.appendChild(link);
      return span.outerHTML;
    }
  },
];

var employerColumns = [
  {data: 'employer', className: 'all', orderable: false},
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var uri = URI('/receipts')
        .query({
          committee_id: row.committee_id,
          contributor_employer: row.employer,
        });
      return tables.buildAggregateLink(data, uri, row.cycle);
    }
  }
];

var occupationColumns = [
  {data: 'occupation', className: 'all', orderable: false},
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var uri = URI('/receipts')
        .query({
          committee_id: row.committee_id,
          contributor_occupation: row.occupation,
        });
      return tables.buildAggregateLink(data, uri, row.cycle);
    }
  }
];

var filingsColumns = [
  {
    data: 'pdf_url',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var anchor = document.createElement('a');
      anchor.textContent = 'View filing';
      anchor.setAttribute('href', data);
      anchor.setAttribute('target', '_blank');
      return anchor.outerHTML;
    }
  },
  {data: 'amendment_indicator', className: 'min-desktop'},
  {data: 'report_type_full', className: 'min-desktop'},
  tables.dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_receipts', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_disbursements', className: 'min-tablet'}),
  tables.currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'}),
];

var disbursementPurposeColumns = [
  {data: 'purpose', className: 'all', orderable: false},
  tables.currencyColumn({data: 'total', className: 'all', orderable: false})
];

var disbursementRecipientColumns = [
  {data: 'recipient_name', className: 'all', orderable: false},
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var uri = URI('/disbursements')
        .query({
          committee_id: row.committee_id,
          recipient_name: row.recipient_name,
        });
      return tables.buildAggregateLink(data, uri, row.cycle);
    }
  }
];

var disbursementRecipientIDColumns = [
  {
    data: 'recipient_name',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/committee/' + row.recipient_id, 'committee');
    }
  },
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var uri = URI('/disbursements')
        .query({
          committee_id: row.committee_id,
          recipient_id: row.recipient_id,
        });
      return tables.buildAggregateLink(data, uri, row.cycle);
    }
  }
];

$(document).ready(function() {
  $('.data-table').each(function(index, table) {
    var $table = $(table);
    var committeeId = $table.attr('data-committee');
    var cycle = $table.attr('data-cycle');
    var year = $table.attr('data-year');
    var path, query;
    switch ($table.attr('data-type')) {
      case 'committee-contributor':
        path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_contributor'].join('/');
        query = {};
        if (year) {
          query.year = year;
        } else {
          query.cycle = cycle;
        }
        tables.initTable($table, null, path, query, committeeColumns, tables.offsetCallbacks, {
          dom: singlePageTableDOM,
          order: [[1, 'desc']],
          pagingType: 'simple',
          lengthChange: false,
          pageLength: 10,
          useHideNull: false
        });
        break;
      case 'receipts-by-state':
        path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_state'].join('/');
        query = {cycle: parseInt(cycle), per_page: 99, hide_null: true};
        tables.initTable($table, null, path, query, stateColumns,
          _.extend({
            afterRender: tables.barsAfterRender.bind(undefined, undefined)
          }, tables.offsetCallbacks), {
          dom: 't',
          order: [[1, 'desc']],
          paging: false,
          lengthChange: false,
          pageLength: 10,
          useHideNull: false,
          scrollY: 400,
          scrollCollapse: true
        });
        events.on('state.map', function(params) {
          var $scrollBody = $table.closest('.dataTables_scrollBody');
          var $row = $scrollBody.find('span[data-state="' + params.state + '"]');
          $scrollBody.find('.active').removeClass('active');
          $row.parents('tr').addClass('active');
          $scrollBody.animate({
            scrollTop: $row.closest('tr').height() * parseInt($row.attr('data-row'))
          }, 500);
        });
        $table.on('click', 'tr', function(e) {
          events.emit('state.table', {state: $(this).find('span[data-state]').attr('data-state')});
        });
        break;
      case 'receipts-by-employer':
        path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_employer'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTable($table, null, path, query, employerColumns, tables.offsetCallbacks, {
          dom: singlePageTableDOM,
          order: [[1, 'desc']],
          pagingType: 'simple',
          lengthChange: false,
          pageLength: 10,
          useHideNull: false
        });
        break;
      case 'receipts-by-occupation':
        path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_occupation'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTable($table, null, path, query, occupationColumns, tables.offsetCallbacks, {
          dom: singlePageTableDOM,
          order: [[1, 'desc']],
          pagingType: 'simple',
          lengthChange: false,
          pageLength: 10,
          useHideNull: false
        });
        break;
      case 'filing':
        var $form = $('#category-filters');
        tables.initTable($table, $form, 'committee/' + committeeId + '/filings', {}, filingsColumns, tables.offsetCallbacks, {
          dom: 't<"results-info results-info--bottom meta-box"lfrip>',
          // Order by receipt date descending
          order: [[4, 'desc']],
        });
        break;
      case 'disbursements-by-purpose':
        path = ['committee', committeeId, 'schedules', 'schedule_b', 'by_purpose'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTable($table, null, path, query, disbursementPurposeColumns, tables.offsetCallbacks, {
          dom: singlePageTableDOM,
          order: [[1, 'desc']],
          pagingType: 'simple',
          lengthChange: false,
          pageLength: 10,
          useHideNull: false
        });
        break;
      case 'disbursements-by-recipient':
        path = ['committee', committeeId, 'schedules', 'schedule_b', 'by_recipient'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTable($table, null, path, query, disbursementRecipientColumns, tables.offsetCallbacks, {
          dom: singlePageTableDOM,
          order: [[1, 'desc']],
          pagingType: 'simple',
          lengthChange: false,
          pageLength: 10,
          useHideNull: false
        });
        break;
      case 'disbursements-by-recipient-id':
        path = ['committee', committeeId, 'schedules', 'schedule_b', 'by_recipient_id'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTable($table, null, path, query, disbursementRecipientIDColumns, tables.offsetCallbacks, {
          dom: singlePageTableDOM,
          order: [[1, 'desc']],
          pagingType: 'simple',
          lengthChange: false,
          pageLength: 10,
          useHideNull: false
        });
        break;
    }
  });
});
