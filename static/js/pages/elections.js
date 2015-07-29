'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');

var tables = require('../modules/tables');

var comparisonTemplate = require('../../templates/comparison.hbs');

var columns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  {data: 'candidate_status_full', className: 'min-tablet'},
  tables.currencyColumn({data: 'total_receipts'}),
  tables.currencyColumn({data: 'total_disbursements'}),
  tables.currencyColumn({data: 'cash_on_hand_end_period'}),
  {
    data: 'pdf_url',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var anchor = document.createElement('a');
      anchor.textContent = row.document_description;
      anchor.setAttribute('href', data);
      anchor.setAttribute('target', '_blank');
      return anchor.outerHTML;
    }
  },
];

var sizeColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  tables.currencyColumn({data: '0'}),
  tables.currencyColumn({data: '200'}),
  tables.currencyColumn({data: '500'}),
  tables.currencyColumn({data: '1000'}),
  tables.currencyColumn({data: '2000'})
];

var typeColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  tables.currencyColumn({data: 'individual'}),
  tables.currencyColumn({data: 'committee'}),
];

var stateColumn = {'data': 'state'};
function stateColumns(results) {
  var columns = _.map(results, function(result) {
    return tables.currencyColumn({data: result.candidate_id});
  });
  return [stateColumn].concat(columns);
}

function drawComparison(results) {
  $('#comparison').html(comparisonTemplate(results));
}

function mapSize(response, primary) {
  var groups = {};
  _.each(response.results, function(result) {
    groups[result.candidate_id] = groups[result.candidate_id] || {};
    groups[result.candidate_id][result.size] = result.total;
  });
  return _.map(_.pairs(groups), function(pair) {
    return _.extend(
      pair[1], {
        candidate_id: pair[0],
        candidate_name: primary[pair[0]].candidate_name
      });
  });
}

function mapState(response, primary) {
  var groups = {};
  _.each(response.results, function(result) {
    groups[result.state] = groups[result.state] || {};
    groups[result.state][result.candidate_id] = result.total;
    groups[result.state].state_full = result.state_full;
  });
  return _.map(_.pairs(groups), function(pair) {
    return _.extend(
      pair[1], {state: pair[0]});
  });
}

function drawSizeTable(results) {
  var $table = $('table[data-type="by-size"]');
  var params = URI.parseQuery(window.location.search);
  var query = {
    cycle: params.cycle,
    candidate_id: _.pluck(results, 'candidate_id')
  };
  var primary = _.object(_.map(results, function(result) {
    return [result.candidate_id, result];
  }));
  $.getJSON(
    URI(API_LOCATION)
    .path([API_VERSION, 'schedules/schedule_a/by_size/by_candidate'].join('/'))
    .addQuery(query)
    .toString()
  ).done(function(response) {
    var data = mapSize(response, primary);
    $table.dataTable({
      data: data,
      columns: sizeColumns,
      lengthChange: false,
      serverSide: false,
      paging: false,
    });
  });
}

function drawStateTable(results) {
  var $table = $('table[data-type="by-state"]');
  var params = URI.parseQuery(window.location.search);
  var query = {
    cycle: params.cycle,
    candidate_id: _.pluck(results, 'candidate_id')
  };
  var primary = _.object(_.map(results, function(result) {
    return [result.candidate_id, result];
  }));
  $.getJSON(
    URI(API_LOCATION)
    .path([API_VERSION, 'schedules/schedule_a/by_state/by_candidate'].join('/'))
    .addQuery(query)
    .addQuery({per_page: 99999})
    .toString()
  ).done(function(response) {
    if ($.fn.dataTable.isDataTable($table)) {
      $table.DataTable().destroy();
    }
    var headers = _.map(results, function(result) {
      return $('<th scope="col">' + result.candidate_name + '</th>');
    });
    $table.find('thead').html([$('<th scope="col">State</th>')].concat(headers));
    var data = mapState(response, primary);
    $table.dataTable({
      data: data,
      columns: stateColumns(results),
      lengthChange: false,
      serverSide: false,
      paging: false,
    });
  });
}

$(document).ready(function() {
  var $table = $('#results');
  var query = URI.parseQuery(window.location.search);
  tables.initTable($table, null, 'elections', query, columns, tables.offsetCallbacks, {
    ordering: false,
    dom: '<"results-info meta-box results-info--top"lfrip>t',
    pagingType: 'simple',
    lengthChange: false,
    pageLength: 10
  });
  $table.on('xhr.dt', function(event, settings, json) {
    drawComparison(json.data);
    drawSizeTable(json.data);
    drawStateTable(json.data);
  });
});
