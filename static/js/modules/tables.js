'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

var helpers = require('./helpers');

require('datatables');
require('drmonty-datatables-responsive');

var filters = require('./filters');

function yearRange(first, last) {
  if (first === last) {
    return first;
  } else {
    return first.toString() + ' - ' + last.toString();
  }
}

function mapFilters(filters) {
  return _.reduce(filters, function(acc, val) {
    if (val.value) {
      if (acc[val.name]) {
        acc[val.name].push(val.value);
      } else {
        acc[val.name] = [val.value];
      }
    }
    return acc;
  }, {});
}

var parsedFilters;

function buildCycle(datum) {
  if (parsedFilters.cycle) {
    var cycles = _.intersection(
      _.map(parsedFilters.cycle, function(cycle) {return parseInt(cycle);}),
      datum.cycles
    );
    return '?cycle=' + _.max(cycles);
  } else {
    return '';
  }
}

function buildEntityLink(data, url, category) {
  var anchor = document.createElement('a');
  anchor.textContent = data;
  anchor.setAttribute('href', url);
  anchor.setAttribute('title', data);
  anchor.setAttribute('data-category', category);
  anchor.classList.add('single-link');
  return anchor.outerHTML;
}

function formattedColumn(formatter) {
  return function(opts) {
    return _.extend({
      render: function(data, type, row, meta) {
        return formatter(data);
      }
    }, opts);
  };
}

var dateColumn = formattedColumn(helpers.datetime);
var currencyColumn = formattedColumn(helpers.currency);

var candidateColumns = [
  {
    data: 'name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return buildEntityLink(data, '/candidate/' + row.candidate_id + buildCycle(row), 'candidate');
    }
  },
  {data: 'office_full', className: 'min-tablet'},
  {
    data: 'cycles',
    className: 'min-tablet',
    render: function(data, type, row, meta) {
      return yearRange(_.first(data), _.last(data));
    }
  },
  {data: 'party_full', className: 'min-tablet'},
  {data: 'state', className: 'min-desktop'},
  {data: 'district', className: 'min-desktop'},
];

var committeeColumns = [
  {
    data: 'name',
    className: 'all',
    width: '20%',
    render: function(data, type, row, meta) {
      return buildEntityLink(data, '/committee/' + row.committee_id + buildCycle(row), 'committee');
    }
  },
  {data: 'treasurer_name', className: 'min-desktop'},
  {data: 'state', className: 'min-desktop', width: '60px'},
  {data: 'party_full', className: 'min-desktop'},
  {data: 'committee_type_full', className: 'min-tablet'},
  {data: 'designation_full', className: 'min-tablet'},
  {data: 'organization_type_full', className: 'min-desktop'},
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
  {data: 'committee_name', className: 'min-desktop'},
  {data: 'amendment_indicator', className: 'min-desktop'},
  {data: 'report_type_full', className: 'min-desktop'},
  dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  currencyColumn({data: 'total_receipts', className: 'min-tablet'}),
  currencyColumn({data: 'total_disbursements', className: 'min-tablet'}),
  currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'}),
];

var filingsTableColumns = [
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
  {data: 'committee_name', className: 'min-desktop', orderable: false},
  {data: 'candidate_name', className: 'min-desktop', orderable: false},
  {data: 'amendment_indicator', className: 'min-desktop'},
  {data: 'report_type_full', className: 'min-desktop', orderable: false},
  dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  currencyColumn({data: 'total_receipts', className: 'min-tablet'}),
  currencyColumn({data: 'total_disbursements', className: 'min-tablet'}),
  currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'}),
];

function mapSort(order, columns) {
  return _.map(order, function(item) {
    var name = columns[item.column].data;
    if (item.dir === 'desc') {
      name = '-' + name;
    }
    return name;
  });
}

function mapResponse(response) {
  return {
    recordsTotal: response.pagination.count,
    recordsFiltered: response.pagination.count,
    data: response.results
  };
}

function pushQuery(filters) {
  var params = URI('').query(filters).toString();
  if (window.location.search !== params) {
    window.history.pushState(filters, params, params || window.location.pathname);
  }
}

function initTable($table, $form, baseUrl, columns, opts) {
  var draw;
  var $hideNullWidget = $(
    '<div class="row" style="text-align: center; margin-top: 10px">' +
      '<input type="checkbox" name="sort_hide_null" checked /> ' +
      'Hide results with missing values when sorting' +
    '</div>'
  );
  opts = _.extend({
    serverSide: true,
    searching: false,
    columns: columns,
    lengthMenu: [30, 50, 100],
    responsive: true,
    language: {
      lengthMenu: 'Results per page: _MENU_'
    },
    dom: '<"results-info meta-box results-info--top"lfrip>t<"results-info meta-box"ip>',
    ajax: function(data, callback, settings) {
      var api = this.api();
      var filters = $form.serializeArray();
      parsedFilters = mapFilters(filters);
      pushQuery(parsedFilters);
      var query = $.extend(
        {
          per_page: data.length,
          page: Math.floor(data.start / data.length) + 1,
          api_key: API_KEY
        },
        parsedFilters,
        {sort_hide_null: $hideNullWidget.find('input').is(':checked')}
      );
      query.sort = mapSort(data.order, columns);
      $.getJSON(
        URI(API_LOCATION)
        .path([API_VERSION, baseUrl].join('/'))
        .query(query)
        .toString()
      ).done(function(response) {
        callback(mapResponse(response));
      });
    }
  }, opts || {});
  var api = $table.DataTable(opts);
  var $paging = $(api.table().container()).find('.results-info--top');
  $paging.prepend($('#filter-toggle'));
  $paging.append($hideNullWidget);
  // Update filters and data table on navigation
  $(window).on('popstate', function() {
    filters.activateInitialFilters();
    api.ajax.reload();
  });
  $form.submit(function(event) {
    event.preventDefault();
    api.ajax.reload();
  });
}

module.exports = {
  init: function() {
    var $table = $('#results');
    var $form = $('#category-filters');
    switch ($table.attr('data-type')) {
      case 'candidate':
        initTable($table, $form, 'candidates', candidateColumns);
        break;
      case 'committee':
        initTable($table, $form, 'committees', committeeColumns);
        break;
      case 'filing-table':
        initTable($table, $form, 'filings', filingsTableColumns, {
          // Order by receipt date descending
          order: [[5, 'desc']],
        });
        break;
      case 'filing':
        var committeeId = $table.attr('data-committee');
        initTable($table, $form, 'committee/' + committeeId + '/filings', filingsColumns, {
          // Order by receipt date descending
          order: [[4, 'desc']],
        });
        break;
    }
  }
};
