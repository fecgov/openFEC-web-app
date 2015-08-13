'use strict';

/* global require, module, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var tabs = require('../vendor/tablist');

var maps = require('../modules/maps');
var events = require('../modules/events');
var tables = require('../modules/tables');
var helpers = require('../modules/helpers');

var singlePageTableDOM = 't<"results-info results-info--bottom meta-box"frip>';

var tableOpts = {
  dom: singlePageTableDOM,
  pagingType: 'simple',
  lengthChange: false,
  pageLength: 10,
  useHideNull: false
};

var sizeInfo = {
  0: {limits: [0, 199.99], label: 'Under $200'},
  200: {limits: [200, 499.99], label: '$200 - $499'},
  500: {limits: [500, 999.99], label: '$500 - $999'},
  1000: {limits: [1000, 1999.99], label: '$1000 - $1999'},
  2000: {limits: [2000, null], label: 'Over $2000'},
};

var sizeColumns = [
  {
    data: 'size',
    width: '50%',
    className: 'all',
    render: function(data, type, row, meta) {
      return sizeInfo[data].label;
    }
  },
  {
    data: 'total',
    width: '50%',
    className: 'all',
    render: tables.buildTotalLink(function(row) {
      var info = sizeInfo[row.size];
      return {
        min_amount: info.limits[0],
        max_amount: info.limits[1]
      };
    })
  }
];

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
    render: tables.buildTotalLink(function(row) {
      return {contributor_id: row.contributor_id};
    })
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
    render: tables.buildTotalLink(function(row) {
      return {contributor_state: row.contributor_state};
    })
  },
];

var employerColumns = [
  {data: 'employer', className: 'all', orderable: false},
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: tables.buildTotalLink(function(row) {
      return {contributor_employer: row.employer};
    })
  }
];

var occupationColumns = [
  {data: 'occupation', className: 'all', orderable: false},
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: tables.buildTotalLink(function(row) {
      return {contributor_occupation: row.occupation};
    })
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
  tables.barCurrencyColumn({data: 'total', className: 'all', orderable: false})
];

var disbursementRecipientColumns = [
  {data: 'recipient_name', className: 'all', orderable: false},
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: tables.buildTotalLink(function(row) {
      return {recipient_name: row.recipient_name};
    })
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
    render: tables.buildTotalLink(function(row) {
      return {recipient_id: row.recipient_id};
    })
  }
];

function buildStateUrl($elm) {
  return URI(API_LOCATION)
    .path([
      API_VERSION,
      'committee',
      $elm.data('committee-id'),
      'schedules',
      'schedule_a',
      'by_state'
    ].join('/'))
    .query({
      cycle: $elm.data('cycle'),
      per_page: 99
    })
    .toString();
}

var aggregateCallbacks = _.extend(
  {afterRender: tables.barsAfterRender.bind(undefined, undefined)},
  tables.offsetCallbacks
);

$(document).ready(function() {
  // Set up data tables
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
        tables.initTableDeferred($table, null, path, query, committeeColumns, aggregateCallbacks, {
          dom: singlePageTableDOM,
          order: [[1, 'desc']],
          pagingType: 'simple',
          lengthChange: false,
          pageLength: 10,
          useHideNull: false
        });
        break;
      case 'contribution-size':
        path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_size'].join('/');
        query = {cycle: cycle};
        tables.initTableDeferred($table, null, path, query, sizeColumns, aggregateCallbacks, {
          dom: 't',
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
        tables.initTableDeferred($table, null, path, query, stateColumns, aggregateCallbacks,
          _.extend(
            {},
            tableOpts,
            {
              dom: 't',
              order: [[1, 'desc']],
              paging: false,
              scrollY: 400,
              scrollCollapse: true
            }
          )
        );
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
        tables.initTableDeferred($table, null, path, query, employerColumns, aggregateCallbacks, _.extend({}, tableOpts, {
          order: [[1, 'desc']],
        }));
        break;
      case 'receipts-by-occupation':
        path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_occupation'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTableDeferred($table, null, path, query, occupationColumns, aggregateCallbacks, _.extend({}, tableOpts, {
          order: [[1, 'desc']],
        }));
        break;
      case 'filing':
        var $form = $('#category-filters');
        tables.initTableDeferred($table, $form, 'committee/' + committeeId + '/filings', {}, filingsColumns, tables.offsetCallbacks, {
          dom: 't<"results-info results-info--bottom meta-box"lfrip>',
          // Order by receipt date descending
          order: [[4, 'desc']],
        });
        break;
      case 'disbursements-by-purpose':
        path = ['committee', committeeId, 'schedules', 'schedule_b', 'by_purpose'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTableDeferred($table, null, path, query, disbursementPurposeColumns, aggregateCallbacks, _.extend({}, tableOpts, {
          order: [[1, 'desc']],
        }));
        break;
      case 'disbursements-by-recipient':
        path = ['committee', committeeId, 'schedules', 'schedule_b', 'by_recipient'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTableDeferred($table, null, path, query, disbursementRecipientColumns, aggregateCallbacks, _.extend({}, tableOpts, {
          order: [[1, 'desc']],
        }));
        break;
      case 'disbursements-by-recipient-id':
        path = ['committee', committeeId, 'schedules', 'schedule_b', 'by_recipient_id'].join('/');
        query = {cycle: parseInt(cycle)};
        tables.initTableDeferred($table, null, path, query, disbursementRecipientIDColumns, aggregateCallbacks, _.extend({}, tableOpts, {
          order: [[1, 'desc']],
        }));
        break;
    }
  });

  // Set up state map
  var $map = $('.state-map');
  var url = buildStateUrl($map);
  $.getJSON(url).done(function(data) {
    maps.stateMap($map, data, 400, 400);
  });
  events.on('state.table', function(params) {
    maps.highlightState($map, params.state);
  });
  $map.on('click', 'path[data-state]', function(e) {
    var state = $(this).attr('data-state');
    maps.highlightState($map, state);
    events.emit('state.map', {state: state});
  });
});
