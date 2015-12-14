'use strict';

/* global window, document */

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');
var tabs = require('../vendor/tablist');
var accessibility = require('fec-style/js/accessibility');

require('datatables');
require('drmonty-datatables-responsive');

var helpers = require('./helpers');
var analytics = require('./analytics');

var hideNullTemplate = require('../../templates/tables/hideNull.hbs');

var simpleDOM = 't<"results-info"ip>';

// Only show table after draw
$(document.body).on('draw.dt', function() {
  $('.datatable__container').css('opacity', '1');
  $('.dataTable tbody td:first-child').attr('scope','row');
});

function yearRange(first, last) {
  if (first === last) {
    return first;
  } else {
    return first.toString() + ' - ' + last.toString();
  }
}

function getCycle(datum, meta) {
  var dataTable = DataTable.registry[meta.settings.sTableId];
  var filters = dataTable && dataTable.filters;
  if (filters && filters.cycle) {
    var cycles = _.intersection(
      _.map(filters.cycle, function(cycle) { return parseInt(cycle); }),
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
    var params = getParams(data, type, row, meta);
    var span = document.createElement('div');
    span.setAttribute('data-value', data);
    span.setAttribute('data-row', meta.row);
    if (params) {
      var link = document.createElement('a');
      link.textContent = helpers.currency(data);
      link.setAttribute('title', 'View individual transactions');
      var uri = helpers.buildAppUrl(path, _.extend(
        {committee_id: row.committee_id},
        buildAggregateUrl(_.extend({}, row, params).cycle),
        params
      ));
      link.setAttribute('href', uri);
      span.appendChild(link);
    } else {
      span.textContent = helpers.currency(data);
    }
    return span.outerHTML;
  };
}

function formattedColumn(formatter, defaultOpts) {
  defaultOpts = defaultOpts || {};
  return function(opts) {
    return _.extend({}, defaultOpts, {
      render: function(data, type, row, meta) {
        return formatter(data, type, row, meta);
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

var candidateColumn = formattedColumn(function(data, type, row) {
  if (row) {
    return buildEntityLink(row.candidate_name, helpers.buildAppUrl(['candidate', row.candidate_id]), 'candidate');
  } else {
    return '';
  }
});

var committeeColumn = formattedColumn(function(data, type, row) {
  if (row) {
    return buildEntityLink(row.committee_name, helpers.buildAppUrl(['committee', row.committee_id]), 'committee');
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

function compareQuery(first, second, keys) {
  keys = keys || _.union(_.keys(first), _.keys(second));
  var different = _.find(keys, function(key) {
    return !_.isEqual(
      helpers.ensureArray(first[key]).sort(),
      helpers.ensureArray(second[key]).sort()
    );
  });
  return !different;
}

function nextUrl(params, fields) {
  var query = URI.parseQuery(window.location.search);
  if (!compareQuery(query, params, fields)) {
    // Clear and update filter fields
    _.each(fields, function(field) {
      delete query[field];
    });
    params = _.extend(query, params);
    return URI('').query(params).toString();
  } else {
    return null;
  }
}

function updateQuery(params, fields) {
  var queryString = nextUrl(params, fields);
  if (queryString !== null) {
    window.history.replaceState(params, queryString, queryString || window.location.pathname);
  }
}

function pushQuery(params, fields) {
  var queryString = nextUrl(params, fields);
  if (queryString !== null) {
    window.history.pushState(params, queryString, queryString || window.location.pathname);
    analytics.pageView();
  }
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

    // Add a class to the .dataTables_wrapper
    $table.closest('.dataTables_wrapper').addClass('dataTables_wrapper--panel');

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

function OffsetPaginator() {}

OffsetPaginator.prototype.mapQuery = function(data) {
  return {
    per_page: data.length,
    page: Math.floor(data.start / data.length) + 1,
  };
};

OffsetPaginator.prototype.handleResponse = function() {};

function SeekPaginator() {
  this.indexes = {};
  this.query = null;
}

SeekPaginator.prototype.getIndexes = function(length, start) {
  return (this.indexes[length] || {})[start] || {};
};

SeekPaginator.prototype.setIndexes = function(length, start, value) {
  this.indexes[length] = this.indexes[length] || {};
  this.indexes[length][start] = value;
};

SeekPaginator.prototype.clearIndexes = function() {
  this.indexes = {};
};

SeekPaginator.prototype.mapQuery = function(data, query) {
  if (!_.isEqual(query, this.query)) {
    this.query = _.clone(query);
    this.clearIndexes();
  }
  var indexes = this.getIndexes(data.length, data.start);
  return _.extend(
    {per_page: data.length},
    _.chain(Object.keys(indexes))
      .filter(function(key) { return indexes[key]; })
      .map(function(key) { return [key, indexes[key]]; })
      .object()
      .value()
  );
};

SeekPaginator.prototype.handleResponse = function(data, response) {
  this.setIndexes(data.length, data.length + data.start, response.pagination.last_indexes);
};

var defaultOpts = {
  serverSide: true,
  searching: false,
  useHideNull: true,
  lengthMenu: [30, 50, 100],
  responsive: {details: false},
  language: {lengthMenu: 'Results per page: _MENU_'},
  dom: '<"js-results-info results-info results-info--top"lfrp><"panel__main"t><"results-info"ip>',
};

var defaultCallbacks = {
  afterRender: function() {}
};

function DataTable(selector, opts) {
  opts = opts || {};
  this.$body = $(selector);
  this.opts = _.extend({}, defaultOpts, {ajax: this.fetch.bind(this)}, opts);
  this.callbacks = _.extend({}, defaultCallbacks, opts.callbacks);
  this.filterSet = (this.opts.panel || {}).filterSet;

  this.xhr = null;
  this.fetchContext = null;
  this.hasWidgets = null;
  this.filters = null;

  var Paginator = this.opts.paginator || OffsetPaginator;
  this.paginator = new Paginator();
  this.api = this.$body.DataTable(this.opts);

  DataTable.registry[this.$body.attr('id')] = this;

  if (this.filterSet) {
    updateOnChange(this.filterSet.$body, this.api);
    updateQuery(this.filterSet.serialize(), this.filterSet.fields);
    this.$body.on('draw.dt', adjustFormHeight.bind(null, this.$body, this.filterSet.$body));
  }

  if (this.opts.useFilters) {
    $(window).on('popstate', this.handlePopState.bind(this));
  }

  this.$body.css('width', '100%');
  this.$body.find('tbody').addClass('js-panel-toggle');
}

DataTable.prototype.destroy = function() {
  this.api.destroy();
  delete DataTable.registry[this.$body.attr('id')];
};

DataTable.prototype.handlePopState = function() {
  this.filterSet.activate();
  var filters = this.filterSet.serialize();
  if (!_.isEqual(filters, this.filters)) {
    this.api.ajax.reload();
  }
};

DataTable.prototype.ensureWidgets = function() {
  if (this.hasWidgets) { return; }
  this.$processing = $('<div class="overlay is-loading"></div>').hide();
  this.$body.before(this.$processing);

  if (this.opts.useHideNull) {
    this.$hideNullWidget = $(hideNullTemplate());
    var $paging = this.$body.closest('.dataTables_wrapper').find('.js-results-info');
    $paging.prepend(this.$hideNullWidget);
  }

  this.hasWidgets = true;
};

DataTable.prototype.fetch = function(data, callback) {
  var self = this;
  self.ensureWidgets();
  if (self.filterSet) {
    pushQuery(self.filterSet.serialize(), self.filterSet.fields);
    self.filters = self.filterSet.serialize();
  }
  var url = self.buildUrl(data);
  self.$processing.show();
  if (self.xhr) {
    self.xhr.abort();
  }
  self.fetchContext = {
    data: data,
    callback: callback
  };
  self.xhr = $.getJSON(url);
  self.xhr.done(self.fetchSuccess.bind(self));
  self.xhr.fail(self.fetchError.bind(self));
  self.xhr.always(function() {
    self.$processing.hide();
  });
};

DataTable.prototype.buildUrl = function(data) {
  var query = _.extend({}, this.filters || {});
  query.sort = mapSort(data.order, this.opts.columns);
  if (this.opts.useHideNull) {
    query.sort_hide_null = this.$hideNullWidget.is(':checked');
  }
  query = _.extend(query, this.paginator.mapQuery(data, query));
  return helpers.buildUrl(this.opts.path, _.extend({}, query, this.opts.query || {}));
};

DataTable.prototype.fetchSuccess = function(resp) {
  this.paginator.handleResponse(this.fetchContext.data, resp);
  this.fetchContext.callback(mapResponse(resp));
  this.callbacks.afterRender(this.api, this.fetchContext.data, resp);
  if (this.opts.hideEmpty) {
    this.hideEmpty(resp);
  }
};

DataTable.prototype.fetchError = function() {

};

/**
 * Replace a `DataTable` with placeholder text if no results found. Should only
 * be used with unfiltered tables, else tables may be destroyed on restrictive
 * filtering.
 */
DataTable.prototype.hideEmpty = function(response) {
  if (!response.pagination.count) {
    this.destroy();
    this.$body.before('<div class="message message--alert">No data found.</div>');
    this.$body.remove();
  }
};

DataTable.registry = {};

DataTable.defer = function($table, opts) {
  tabs.onShow($table, function() {
    new DataTable($table, opts);
  });
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
  mapSort: mapSort,
  mapResponse: mapResponse,
  DataTable: DataTable,
  OffsetPaginator: OffsetPaginator,
  SeekPaginator: SeekPaginator
};
