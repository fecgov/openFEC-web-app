'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');

require('datatables');
require('drmonty-datatables-responsive');

var events = require('./events');
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

var committeeContributorColumns = [
  {
    data: 'contributor_name',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      return buildEntityLink(data, '/committee/' + row.contributor_id, 'committee');
    }
  },
  currencyColumn({data: 'total', className: 'all', orderable: false})
];

var stateContributorColumns = [
  {
    data: 'state_full',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var span = document.createElement('span');
      span.textContent = data;
      span.setAttribute('data-state', data);
      span.setAttribute('data-row', meta.row);
      return span.outerHTML;
    }
  },
  currencyColumn({data: 'total', className: 'all', orderable: false})
];

var employerContributorColumns = [
  {data: 'employer', className: 'all', orderable: false},
  currencyColumn({data: 'total', className: 'all', orderable: false})
];

var occupationContributorColumns = [
  {data: 'occupation', className: 'all', orderable: false},
  currencyColumn({data: 'total', className: 'all', orderable: false})
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
    $modal.find('.modal-content').html(template(response.results[index]));
    $modal.attr('aria-hidden', 'false');
  });
}

function handleResponseSeek(api, data, response) {
  api.seekIndex(data.length, data.length + data.start, response.pagination.last_indexes);
}

function initTable($table, $form, baseUrl, baseQuery, columns, callbacks, opts) {
  var draw;
  var $processing = $('<div class="processing">Loading...</div>');
  var $hideNullWidget = $(
    '<div class="results-info__null">' +
      '<input type="checkbox" name="sort_hide_null" checked /> ' +
      'Hide results with missing values when sorting' +
    '</div>'
  );
  var useFilters = opts.useFilters;
  var useHideNull = opts.hasOwnProperty('useHideNull') ? opts.useHideNull : true;
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
      if (useFilters) {
        pushQuery(parsedFilters);
      }
      var query = _.extend(
        callbacks.mapQuery(api, data),
        {api_key: API_KEY},
        parsedFilters
      );
      if (useHideNull) {
        query = _.extend(
          query,
          {sort_hide_null: $hideNullWidget.find('input').is(':checked')}
        );
      }
      query.sort = mapSort(data.order, columns);
      $processing.show();
      $.getJSON(
        URI(API_LOCATION)
        .path([API_VERSION, baseUrl].join('/'))
        .addQuery(baseQuery || {})
        .addQuery(query)
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
  var api = $table.DataTable(opts);
  callbacks = _.extend({
    handleResponse: function() {},
    afterRender: function() {}
  }, callbacks);
  if (useFilters) {
    // Update filters and data table on navigation
    $(window).on('popstate', function() {
      filters.activateInitialFilters();
      api.ajax.reload();
    });
  }
  // Prepare loading message
  $processing.hide();
  $table.before($processing);
  var $paging = $(api.table().container()).find('.results-info--top');
  if (useHideNull) {
    $paging.prepend($hideNullWidget);
  }
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

module.exports = {
  init: function() {
    var $tables = $('.data-table');
    var $form = $('#category-filters');

    var offsetCallbacks = {
      mapQuery: mapQueryOffset
    };
    var seekCallbacks = {
      mapQuery: mapQuerySeek,
      handleResponse: handleResponseSeek
    };
    $tables.each(function(index, elm) {
      var $table = $(elm);
      var committeeId = $table.attr('data-committee');
      var cycle = $table.attr('data-cycle');
      var year = $table.attr('data-year');
      var path, query;
      switch ($table.attr('data-type')) {
        case 'candidate':
          initTable($table, $form, 'candidates', {}, candidateColumns, offsetCallbacks, {useFilters: true});
          break;
        case 'committee':
          initTable($table, $form, 'committees', {}, committeeColumns, offsetCallbacks, {useFilters: true});
          break;
        case 'donation':
          initTable(
            $table,
            $form,
            'schedules/schedule_a',
            {},
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
            {},
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
        case 'committee-contributor':
          path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_contributor'].join('/');
          query = {};
          if (year) {
            query.year = year;
          } else {
            query.cycle = cycle;
          }
          initTable($table, $form, path, query, committeeContributorColumns, offsetCallbacks, {
            dom: '<"results-info meta-box results-info--top"lfrip>t',
            order: [[1, 'desc']],
            pagingType: 'simple',
            lengthChange: false,
            pageLength: 10,
            useHideNull: false
          });
          break;
        case 'receipts-by-state':
          path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_state'].join('/');
          query = {cycle: parseInt(cycle), per_page: 99};
          initTable($table, $form, path, query, stateContributorColumns, offsetCallbacks, {
            dom: '<"results-info meta-box results-info--top"lfrip>t',
            order: [[1, 'desc']],
            paging: false,
            lengthChange: false,
            pageLength: 10,
            useHideNull: false,
            scrollY: 300,
            scrollCollapse: true
          });
          events.on('state.map', function(params) {
            var $scrollBody = $table.closest('.dataTables_scrollBody');
            var $row = $scrollBody.find('span[data-state="' + params.state + '"]');
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
          initTable($table, $form, path, query, employerContributorColumns, offsetCallbacks, {
            dom: '<"results-info meta-box results-info--top"lfrip>t',
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
          initTable($table, $form, path, query, occupationContributorColumns, offsetCallbacks, {
            dom: '<"results-info meta-box results-info--top"lfrip>t',
            order: [[1, 'desc']],
            pagingType: 'simple',
            lengthChange: false,
            pageLength: 10,
            useHideNull: false
          });
          break;
      }
    });
  }
};
