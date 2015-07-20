'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

require('datatables');
require('drmonty-datatables-responsive');

var filters = require('./filters');
var helpers = require('./helpers');

var donationTemplate = require('../../templates/donation.hbs');
var expenditureTemplate = require('../../templates/expenditure.hbs');

$.fn.DataTable.Api.register('seekIndex()', function(length, start, value) {
  var settings = this.context[0];

  // Clear stored indexes on filter change
  if (!_.isEqual(settings._parsedFilters, parsedFilters)) {
    settings._seekIndexes = {};
  }
  settings._parsedFilters = _.clone(parsedFilters);

  // Set or get stored indexes
  if (typeof value !== 'undefined') {
    settings._seekIndexes = settings._seekIndexes || {};
    settings._seekIndexes[length] = settings._seekIndexes[length] || {};
    settings._seekIndexes[length][start] = value;
  } else {
    return ((settings._seekIndexes || {})[length] || {})[start] || undefined;
  }
});

function yearRange(first, last) {
  if (first === last) {
    return first;
  } else {
    return first.toString() + ' - ' + last.toString();
  }
}

function mapFilters(filters) {
  return _.reduce(filters, function(acc, val) {
    if (val.value && val.name.slice(0, 1) !== '_') {
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
  dateColumn({data: 'first_file_date', className: 'min-tablet'}),
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
  currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet'})
];

var donationColumns = [
  {
    width: '5%',
    render: function(data, type, row, meta) {
      return '<span class="modal-toggle">+</span>';
    }
  },
  {
    data: 'contributor',
    orderable: false,
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      if (data) {
        return buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return row.contributor_name;
      }
    }
  },
  {data: 'contributor_state', orderable: false, className: 'min-desktop'},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop'},
  currencyColumn({data: 'contributor_receipt_amount', className: 'min-tablet'}),
  dateColumn({data: 'contributor_receipt_date', className: 'min-tablet'}),
  {
    data: 'committee',
    orderable: false,
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      if (data) {
        return buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return '';
      }
    }
  },
];

var expenditureColumns = [
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
        return buildEntityLink(committee.name, '/committee/' + committee.committee_id, 'committee');
      } else {
        return data;
      }
    }
  },
  {data: 'recipient_state', orderable: false, className: 'min-desktop'},
  currencyColumn({data: 'disbursement_amount', className: 'min-tablet'}),
  dateColumn({data: 'disbursement_date', className: 'min-tablet'}),
  {
    data: 'committee',
    orderable: false,
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      if (data) {
        return buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
      } else {
        return '';
      }
    }
  },
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

function mapQueryOffset(api, data) {
  return {
    per_page: data.length,
    page: Math.floor(data.start / data.length) + 1,
  };
}

function mapQuerySeek(api, data) {
  var indexes = api.seekIndex(data.length, data.start) || {};
  return _.extend(
    {per_page: data.length},
    _.chain(Object.keys(indexes))
      .filter(function(key) { return indexes[key]; })
      .map(function(key) { return [key, indexes[key]]; })
      .object()
      .value()
  );
}

function modalAfterRender(template, api, data, response) {
  var $table = $(api.table().node());
  $table.on('click', '.modal-toggle', function(e) {
    var row = $(e.target).closest('tr');
    var index = api.row(row).index();
    var $modal = $('#datatable-modal');
    $modal.find('.modal__content').html(template(response.results[index]));
    $modal.attr('aria-hidden', 'false');
  });
}

function handleResponseSeek(api, data, response) {
  api.seekIndex(data.length, data.length + data.start, response.pagination.last_indexes);
}

function initTable($table, $form, baseUrl, columns, callbacks, opts) {
  var draw;
  var $processing = $('<div class="processing">Loading...</div>');
  var $hideNullWidget = $(
    '<div class="results-info__null">' +
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
        callbacks.mapQuery(api, data),
        {api_key: API_KEY},
        parsedFilters,
        {sort_hide_null: $hideNullWidget.find('input').is(':checked')}
      );
      query.sort = mapSort(data.order, columns);
      $processing.show();
      $.getJSON(
        URI(API_LOCATION)
        .path([API_VERSION, baseUrl].join('/'))
        .query(query)
        .toString()
      ).done(function(response) {
        callbacks.handleResponse(api, data, response);
        callback(mapResponse(response));
        callbacks.afterRender(api, data, response);
      }).always(function() {
        $processing.hide();
      });
    }
  }, opts || {});
  callbacks = _.extend({
    handleResponse: function() {},
    afterRender: function() {}
  }, callbacks);
  var api = $table.DataTable(opts);
  // Prepare loading message
  $processing.hide();
  $table.before($processing);
  var $paging = $(api.table().container()).find('.results-info--top');
  $paging.prepend($hideNullWidget);
  $table.css('width', '100%');
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

var offsetCallbacks = {
  mapQuery: mapQueryOffset
};
var seekCallbacks = {
  mapQuery: mapQuerySeek,
  handleResponse: handleResponseSeek
};

module.exports = {
  init: function() {
    var $table = $('#results');
    var $form = $('#category-filters');
    switch ($table.attr('data-type')) {
      case 'candidate':
        initTable($table, $form, 'candidates', candidateColumns, offsetCallbacks);
        break;
      case 'committee':
        initTable($table, $form, 'committees', committeeColumns, offsetCallbacks);
        break;
      case 'filing-table':
        initTable($table, $form, 'filings', filingsTableColumns, offsetCallbacks, {
          // Order by receipt date descending
          order: [[5, 'desc']],
        });
        break;
      case 'filing':
        var committeeId = $table.attr('data-committee');
        initTable($table, $form, 'committee/' + committeeId + '/filings', filingsColumns, offsetCallbacks, {
          // Order by receipt date descending
          order: [[4, 'desc']],
        });
        break;
      case 'donation':
        initTable(
          $table,
          $form,
          'schedules/schedule_a',
          donationColumns,
          {
            mapQuery: mapQuerySeek,
            handleResponse: handleResponseSeek,
            afterRender: modalAfterRender.bind(undefined, donationTemplate)
          },
          {
            order: [[5, 'desc']],
            pagingType: 'simple'
          }
        );
        break;
      case 'expenditure':
        initTable(
          $table,
          $form,
          'schedules/schedule_b',
          expenditureColumns,
          {
            mapQuery: mapQuerySeek,
            handleResponse: handleResponseSeek,
            afterRender: modalAfterRender.bind(undefined, expenditureTemplate)
          },
          {
            order: [[4, 'desc']],
            pagingType: 'simple'
          }
        );
        break;
    }
  }
};
