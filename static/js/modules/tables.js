'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');
var tabs = require('../vendor/tablist');

require('datatables');
require('drmonty-datatables-responsive');

var filters = require('./filters');
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

function buildAggregateUrl(uri, cycle) {
  var dates = helpers.cycleDates(cycle);
  return uri.addQuery({
    min_date: dates.min,
    max_date: dates.max
  }).toString();
}

function buildAggregateLink(data, uri, cycle) {
  var anchor = document.createElement('a');
  anchor.textContent = helpers.currency(data);
  anchor.setAttribute('href', buildAggregateUrl(uri, cycle));
  anchor.setAttribute('title', 'View individual transactions');
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

function barColumn(formatter) {
  formatter = formatter || function(value) { return value; };
  return function(opts) {
    return _.extend({
      render: function(data, type, row, meta) {
        var span = document.createElement('div');
        span.textContent = formatter(data);
        span.setAttribute('data-value', data);
        span.setAttribute('data-row', meta.row);
        return span.outerHTML;
      }
    }, opts);
  };
}

var dateColumn = formattedColumn(helpers.datetime);
var currencyColumn = formattedColumn(helpers.currency);
var barCurrencyColumn = barColumn(helpers.currency);

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

function ensureArray(value) {
  return _.isArray(value) ? value : [value];
}

function compareQuery(first, second) {
  var keys = _.keys(first);
  if (!_.isEqual(keys.sort(), _.keys(second).sort())) {
    return false;
  }
  var different = _.find(keys, function(key) {
    return !_.isEqual(
      ensureArray(first[key]).sort(),
      ensureArray(second[key]).sort()
    );
  });
  return !different;
}

function pushQuery(params) {
  var query = URI.parseQuery(window.location.search);
  if (!compareQuery(query, params)) {
    // Clear and update filter fields
    _.each(filters.getFields(), function(field) {
      delete query[field];
    });
    params = _.extend(query, params);
    var queryString = URI('').query(params).toString();
    window.history.pushState(params, queryString, queryString || window.location.pathname);
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
  var $table = $(api.table().node()),
      $modal = $('#datatable-modal');

  // Move the modal to the results div.
  $modal.appendTo($('#results'));

  $table.on('click', '.js-panel-toggle tr', function(ev) {
    if ($(ev.target).is('a')) {
      return true;
    }
    var $row = $(ev.target).closest('tr');
    var index = api.row($row).index();
    $modal.find('.js-panel-content').html(template(response.results[index]));
    $modal.attr('aria-hidden', 'false');
    $row.siblings().toggleClass('row-active', false);
    $row.toggleClass('row-active', true);
    $('body').toggleClass('panel-active', true);
    var hideColumns = api.columns('.hide-panel');
    hideColumns.visible(false);
    // When under $large-screen
    // TODO figure way to share these values with CSS.
    if ($(document).width() < 980) {
      api.columns('.hide-panel-tablet').visible(false);
    }
  });

  $modal.on('click', '.js-panel-close', function(ev) {
    ev.preventDefault();
    $('.js-panel-toggle tr').toggleClass('row-active', false);
    $('body').toggleClass('panel-active', false);
    var hideColumns = api.columns('.hide-panel');
    hideColumns.visible(true);
    // When under $large-screen
    if ($(document).width() < 980) {
      api.columns('.hide-panel-tablet').visible(true);
    }
  });
}

function barsAfterRender(template, api, data, response) {
  var $table = $(api.table().node());
  var $cols = $table.find('div[data-value]');
  var values = $cols.map(function(idx, each) {
    return parseFloat(each.getAttribute('data-value'));
  });
  var max = _.max(values);
  $cols.after(function() {
    var width = 100 * parseFloat($(this).attr('data-value')) / max;
    return $('<div>')
      .addClass('value-bar')
      .css('width', _.max([width, 1]) + '%');
  });
}

function handleResponseSeek(api, data, response) {
  api.seekIndex(data.length, data.length + data.start, response.pagination.last_indexes);
}

var defaultCallbacks = {
  preprocess: mapResponse
};

function submitOnChange($form, api) {
  function onChange(e) {
    e.preventDefault();
    api.ajax.reload();
  }
  $form.on('change', 'input,select', _.debounce(onChange, 250));
}

var defaultCallbacks = {
  preprocess: mapResponse
};

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
  callbacks = _.extend({}, defaultCallbacks, callbacks);
  opts = _.extend({
    serverSide: true,
    searching: false,
    columns: columns,
    lengthMenu: [30, 50, 100],
    responsive: {
      details: false
    },
    language: {
      lengthMenu: 'Results per page: _MENU_'
    },
    dom: '<"results-info meta-box results-info--top"lfrip><"panel__main"t><"results-info meta-box"ip>',
    ajax: function(data, callback, settings) {
      var api = this.api();
      if ($form) {
        var filters = $form.serializeArray();
        parsedFilters = mapFilters(filters);
        pushQuery(parsedFilters);
      }
      var query = _.extend(
        callbacks.mapQuery(api, data),
        {api_key: API_KEY},
        parsedFilters || {}
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
        callback(callbacks.preprocess(response));
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
      var tempFilters = mapFilters(filters);
      if (!_.isEqual(tempFilters, parsedFilters)) {
        api.ajax.reload();
      }
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
  $table.find('tbody').addClass('js-panel-toggle');
  if ($form) {
    submitOnChange($form, api);
  }
}

function initTableDeferred($table) {
  var args = _.toArray(arguments);
  tabs.onShow($table, function() {
    initTable.apply(null, args);
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
  yearRange: yearRange,
  buildCycle: buildCycle,
  buildEntityLink: buildEntityLink,
  buildAggregateUrl: buildAggregateUrl,
  buildAggregateLink: buildAggregateLink,
  currencyColumn: currencyColumn,
  barCurrencyColumn: barCurrencyColumn,
  dateColumn: dateColumn,
  modalAfterRender: modalAfterRender,
  barsAfterRender: barsAfterRender,
  offsetCallbacks: offsetCallbacks,
  seekCallbacks: seekCallbacks,
  initTable: initTable,
  initTableDeferred: initTableDeferred
};
