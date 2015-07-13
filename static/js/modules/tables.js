'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');

require('datatables');
require('drmonty-datatables-responsive');

var helpers = require('./helpers');

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
  {
    data: 'first_file_date',
    className: 'min-tablet',
    render: function(data, type, row, meta) {
      return helpers.datetime(data);
    }
  },
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
  {
    data: 'total',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      return helpers.currency(data);
    }
  }
];

var individualContributorColumns = [
  {data: 'contributor_name', className: 'all', orderable: false},
  {
    data: 'contributor_aggregate_ytd',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      return helpers.currency(data);
    }
  }
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
    var row = $(e.target).parents('tr');
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
      // pushQuery(parsedFilters);
      var query = _.extend(
        callbacks.mapQuery(api, data),
        {api_key: API_KEY},
        parsedFilters
      );
      query.sort = mapSort(data.order, columns);
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
      });
    }
  }, opts || {});
  callbacks = _.extend({
    handleResponse: function() {},
    afterRender: function() {}
  }, callbacks);
  var api = $table.DataTable(opts);
  // // Update filters and data table on navigation
  // $(window).on('popstate', function() {
  //   filters.activateInitialFilters();
  //   api.ajax.reload();
  // });
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
      var toDate = $table.attr('data-to-date');
      var path, query;
      switch ($table.attr('data-type')) {
        case 'candidate':
          initTable($table, $form, 'candidates', {}, candidateColumns, offsetCallbacks);
          break;
        case 'committee':
          initTable($table, $form, 'committees', {}, committeeColumns, offsetCallbacks);
          break;
        case 'committee-contributor':
          path = ['committee', committeeId, 'schedules', 'schedule_a', 'by_contributor'].join('/');
          query = {};
          if (toDate) {
            query.year = toDate;
          } else {
            query.cycle = cycle;
          }
          initTable($table, $form, path, query, committeeContributorColumns, offsetCallbacks, {
            order: [[1, 'desc']],
            pagingType: 'simple',
            lengthChange: false,
            pageLength: 10
          });
          break;
        case 'individual-contributor':
          path = ['schedules', 'schedule_a'].join('/');
          query = {
            committee_id: committeeId,
            contributor_type: 'individual'
          };
          var minYear, maxYear;
          if (toDate) {
            minYear = maxYear = moment().year(parseInt(toDate));
          } else {
            minYear = moment().year(parseInt(cycle) - 1);
            maxYear = moment().year(parseInt(cycle));
          }
          query = _.extend(query, {
            min_date: minYear.startOf('year').format(),
            max_date: maxYear.endOf('year').format()
          });
          initTable($table, $form, path, query, individualContributorColumns, seekCallbacks, {
            order: [[1, 'desc']],
            pagingType: 'simple',
            lengthChange: false,
            pageLength: 10
          });
          break;
      }
    });

    // Move the filter button into the results-info div
    var $filterToggle = $('#filter-toggle');
    $('.results-info--top').prepend($filterToggle);
  }
};
