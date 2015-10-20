'use strict';

/* global require, module, window, document */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var moment = require('moment');
var tabs = require('../vendor/tablist');
var accessibility = require('fec-style/js/accessibility');

require('datatables');
require('drmonty-datatables-responsive');

var filters = require('./filters');
var helpers = require('./helpers');

var simpleDOM = 't<"results-info"ip>';

// Only show table after draw
$(document.body).on('draw.dt', function() {
  $('.datatable__container').css('opacity', '1');
  $('.dataTable tbody td:first-child').attr('scope','row');
});

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

function getCycle(datum) {
  if (parsedFilters && parsedFilters.cycle) {
    var cycles = _.intersection(
      _.map(parsedFilters.cycle, function(cycle) {return parseInt(cycle);}),
      datum.cycles
    );
    return {cycle: _.max(cycles)};
  } else {
    return {};
  }
}

function buildEntityLink(data, url, category, opts) {
  opts = opts || {};
  var anchor = document.createElement('a');
  anchor.textContent = data;
  anchor.setAttribute('href', url);
  anchor.setAttribute('title', data);
  anchor.setAttribute('data-category', category);
  anchor.classList.add('single-link');

  if (opts.isIncumbent) {
    anchor.classList.add('is-incumbent');
  }

  return anchor.outerHTML;
}

function buildAggregateUrl(cycle) {
  var dates = helpers.cycleDates(cycle);
  return {
    min_date: dates.min,
    max_date: dates.max
  };
}

function buildTotalLink(path, getParams) {
  return function(data, type, row, meta) {
    data = data || 0;
    var span = document.createElement('div');
    span.setAttribute('data-value', data);
    span.setAttribute('data-row', meta.row);
    var link = document.createElement('a');
    link.textContent = helpers.currency(data);
    link.setAttribute('title', 'View individual transactions');
    var params = getParams(data, type, row, meta);
    var uri = helpers.buildAppUrl(path, _.extend(
      {committee_id: row.committee_id},
      buildAggregateUrl(_.extend({}, row, params).cycle),
      params
    ));
    link.setAttribute('href', uri);
    span.appendChild(link);
    return span.outerHTML;
  };
}

function formattedColumn(formatter, defaultOpts) {
  defaultOpts = defaultOpts || {};
  return function(opts) {
    return _.extend({}, defaultOpts, {
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
      orderSequence: ['desc', 'asc'],
      render: function(data, type, row, meta) {
        var span = document.createElement('div');
        span.textContent = formatter(_.max([data, 0]));
        span.setAttribute('data-value', data || 0);
        span.setAttribute('data-row', meta.row);
        return span.outerHTML;
      }
    }, opts);
  };
}

function urlColumn(attr, opts) {
  return _.extend({
    render: function(data, type, row, meta) {
      if (row[attr]) {
        var anchor = document.createElement('a');
        anchor.textContent = data;
        anchor.setAttribute('href', row[attr]);
        anchor.setAttribute('target', '_blank');
        return anchor.outerHTML;
      } else {
        return data;
      }
    }
  }, opts);
}

var dateColumn = formattedColumn(helpers.datetime, {orderSequence: ['desc', 'asc']});
var currencyColumn = formattedColumn(helpers.currency, {orderSequence: ['desc', 'asc']});
var barCurrencyColumn = barColumn(helpers.currency);

var candidateColumn = formattedColumn(function(data) {
  if (data) {
    return buildEntityLink(data.name, helpers.buildAppUrl(['candidate', data.candidate_id]), 'candidate');
  } else {
    return '';
  }
});

var committeeColumn = formattedColumn(function(data) {
  if (data) {
    return buildEntityLink(data.name, helpers.buildAppUrl(['committee', data.committee_id]), 'committee');
  } else {
    return '';
  }
});

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

function compareQuery(first, second, keys) {
  keys = keys || _.union(_.keys(first), _.keys(second));
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
  var fields = filters.getFields();
  if (!compareQuery(query, params, fields)) {
    // Clear and update filter fields
    _.each(fields, function(field) {
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

function identity(value) {
  return value;
}

var MODAL_TRIGGER_CLASS = 'js-panel-trigger';
var MODAL_TRIGGER_HTML = '<button class="js-panel-button icon arrow--right">' +
  '<span class="u-visually-hidden">Toggle details</span>' +
'</button>';

function modalRenderRow(row, data, index) {
  row.classList.add(MODAL_TRIGGER_CLASS, 'row--has-panel');
}

function modalRenderFactory(template, fetch) {
  var callback;
  fetch = fetch || identity;
  return function(api, data, response) {
    var $table = $(api.table().node());
    var $modal = $('#datatable-modal');
    var $main = $table.closest('.panel__main');
    // Move the modal to the results div.
    $modal.appendTo($main);
    $modal.css('display', 'block');

    $table.off('click keypress', '.js-panel-toggle tr.' + MODAL_TRIGGER_CLASS, callback);
    callback = function(e) {
      if (e.which === 13 || e.type === 'click') {
        // Note: Use `currentTarget` to get parent row, since the target column
        // may have been moved since the triggering event
        var $row = $(e.currentTarget);
        var $target = $(e.target);
        if ($target.is('a')) {
          return true;
        }
        if (!$target.closest('td').hasClass('dataTables_empty')) {
          var index = api.row($row).index();
          $.when(fetch(response.results[index])).done(function(fetched) {
            $modal.find('.js-panel-content').html(template(fetched));
            $modal.attr('aria-hidden', 'false');
            $row.siblings().toggleClass('row-active', false);
            $row.toggleClass('row-active', true);
            $('body').toggleClass('panel-active', true);
            accessibility.restoreTabindex($modal);
            var hideColumns = api.columns('.hide-panel');
            hideColumns.visible(false);

            // Populate the pdf button if there is one
            if (fetched.pdf_url) {
              $modal.find('.js-pdf_url').attr('href', fetched.pdf_url);
            } else {
              $modal.find('.js-pdf_url').remove();
            }

            // Set focus on the close button
            $('.js-hide').focus();

            // When under $large-screen
            // TODO figure way to share these values with CSS.
            if ($(document).width() < 980) {
              api.columns('.hide-panel-tablet').visible(false);
            }
          });
        }
      }
    };
    $table.on('click keypress', '.js-panel-toggle tr.' + MODAL_TRIGGER_CLASS, callback);

    $modal.on('click', '.js-panel-close', function(e) {
      e.preventDefault();
      hidePanel(api, $modal);
    });

    /* Set focus to highlighted row on blurring anchors if tabbing out of the panel */
    $modal.on('blur', 'a, button', function(e) {
      if (!$modal.has(e.relatedTarget).length) {
        $('.row-active .js-panel-button').focus();
      }
    });
  };
}

function hidePanel(api, $modal) {
    $('.row-active .js-panel-button').focus();
    $('.js-panel-toggle tr').toggleClass('row-active', false);
    $('body').toggleClass('panel-active', false);
    $modal.attr('aria-hidden', 'true');

    if ($(document).width() > 640) {
      api.columns('.hide-panel-tablet').visible(true);
    }

    if ($(document).width() > 980) {
      api.columns('.hide-panel').visible(true);
    }

    accessibility.removeTabindex($modal);
}

function barsAfterRender(template, api, data, response) {
  var $table = $(api.table().node());
  var $cols = $table.find('div[data-value]');
  var values = $cols.map(function(idx, each) {
    return parseFloat(each.getAttribute('data-value'));
  });
  var max = _.max(values);
  $cols.after(function() {
    var value = $(this).attr('data-value');
    var width = 100 * parseFloat(value) / max;
    return '<div class="bar-container">' +
      '<div class="value-bar" style="width: ' + width + '%"></div>' +
    '</div>';
  });
}

function handleResponseSeek(api, data, response) {
  api.seekIndex(data.length, data.length + data.start, response.pagination.last_indexes);
}

var defaultCallbacks = {
  preprocess: mapResponse
};

function updateOnChange($form, api) {
  function onChange(e) {
    e.preventDefault();
    hidePanel(api, $('#datatable-modal'));
    api.ajax.reload();
  }
  $form.on('change', 'input,select', _.debounce(onChange, 250));
}

/**
 * Adjust form height to match table; called after table redraw.
 */
function adjustFormHeight($table, $form) {
  $form.height('');
  var tableHeight = $table.closest('.datatable__container').height();
  var filterHeight = $form.height();
  if (tableHeight > filterHeight && $(document).width() > 980) {
    $form.height(tableHeight);
  }
}

var defaultCallbacks = {
  preprocess: mapResponse
};

function initTable($table, $form, path, baseQuery, columns, callbacks, opts) {
  var draw;
  var $processing = $('<div class="overlay is-loading"></div>');
  var $hideNullWidget = $(
    '<input id="null-checkbox" type="checkbox" name="sort_hide_null" checked>' +
    '<label for="null-checkbox" class="results-info__null">' +
      'Hide results with missing values when sorting' +
    '</label>'
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
    dom: '<"results-info results-info--top"lfrp><"panel__main"t><"results-info"ip>',
    ajax: function(data, callback, settings) {
      var api = this.api();
      if ($form) {
        var filters = $form.serializeArray();
        parsedFilters = mapFilters(filters);
        pushQuery(parsedFilters);
      }
      var query = _.extend(
        callbacks.mapQuery(api, data),
        parsedFilters || {}
      );
      if (useHideNull) {
        query = _.extend(
          query,
          {sort_hide_null: $hideNullWidget.is(':checked')}
        );
      }
      query.sort = mapSort(data.order, columns);
      $processing.show();
      $.getJSON(
        helpers.buildUrl(path, _.extend({}, query, baseQuery || {}))
      ).done(function(response) {
        callbacks.handleResponse(api, data, response);
        callback(callbacks.preprocess(response));
        callbacks.afterRender(api, data, response);
        if (opts.hideEmpty) {
          hideEmpty(api, data, response);
        }
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
    updateOnChange($form, api);
    $table.on('draw.dt', adjustFormHeight.bind(null, $table, $form));
  }
}

/**
 * Replace a `DataTable` with placeholder text if no results found. Should only
 * be used with unfiltered tables, else tables may be destroyed on restrictive
 * filtering.
 */
function hideEmpty(api, data, response) {
  if (!response.pagination.count) {
    api.destroy();
    var $table = $(api.table().node());
    $table.before('<div class="message message--alert">No data found.</div>');
    $table.remove();
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
  simpleDOM: simpleDOM,
  yearRange: yearRange,
  getCycle: getCycle,
  buildTotalLink: buildTotalLink,
  buildEntityLink: buildEntityLink,
  candidateColumn: candidateColumn,
  committeeColumn: committeeColumn,
  currencyColumn: currencyColumn,
  urlColumn: urlColumn,
  barCurrencyColumn: barCurrencyColumn,
  dateColumn: dateColumn,
  barsAfterRender: barsAfterRender,
  modalRenderRow: modalRenderRow,
  modalRenderFactory: modalRenderFactory,
  MODAL_TRIGGER_CLASS: MODAL_TRIGGER_CLASS,
  MODAL_TRIGGER_HTML: MODAL_TRIGGER_HTML,
  offsetCallbacks: offsetCallbacks,
  seekCallbacks: seekCallbacks,
  initTable: initTable,
  initTableDeferred: initTableDeferred
};
