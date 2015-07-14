'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');
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

function initTable($table, $form, baseUrl, columns) {
  var draw;
  var $hideNullWidget = $(
    '<div class="row" style="text-align: center; margin-top: 10px">' +
      '<input type="checkbox" name="sort_hide_null" checked /> ' +
      'Hide results with missing values when sorting' +
    '</div>'
  );
  var api = $table.DataTable({
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
  });
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
  yearRange: yearRange,
  buildCycle: buildCycle,
  buildEntityLink: buildEntityLink,
  initTable: initTable
};
