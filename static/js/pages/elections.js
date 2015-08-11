'use strict';

/* global require, module, window, document, context, API_LOCATION, API_VERSION, API_KEY */

var d3 = require('d3');
var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var chroma = require('chroma-js');

var maps = require('../modules/maps');
var tables = require('../modules/tables');

var comparisonTemplate = require('../../templates/comparison.hbs');
var candidateStateMapTemplate = require('../../templates/candidateStateMap.hbs');

var supportOpposeMap = {
  S: 'Support',
  O: 'Oppose',
};
var independentExpenditureColumns = [
  tables.currencyColumn({data: 'expenditure_amount', className: 'min-tablet'}),
  {
    data: 'committee',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data.name, '/committee/' + data.committee_id, 'committee');
    }
  },
  {
    data: 'support_oppose_indicator',
    orderable: false,
    render: function(data, type, row, meta) {
      return supportOpposeMap[data] || 'Unknown';
    }
  },
  {
    data: 'candidate_name',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
];

var columns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  {data: 'incumbent_challenge_full', className: 'min-tablet'},
  {data: 'party_full', className: 'min-tablet'},
  tables.barCurrencyColumn({data: 'total_receipts'}),
  tables.barCurrencyColumn({data: 'total_disbursements'}),
  tables.barCurrencyColumn({data: 'cash_on_hand_end_period'}),
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
  tables.barCurrencyColumn({data: '0'}),
  tables.barCurrencyColumn({data: '200'}),
  tables.barCurrencyColumn({data: '500'}),
  tables.barCurrencyColumn({data: '1000'}),
  tables.barCurrencyColumn({data: '2000'})
];

var typeColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  tables.barCurrencyColumn({data: 'individual'}),
  tables.barCurrencyColumn({data: 'committee'}),
];

var stateColumn = {'data': 'state'};
function stateColumns(results) {
  var columns = _.map(results, function(result) {
    return tables.barCurrencyColumn({data: result.candidate_id});
  });
  return [stateColumn].concat(columns);
}

function refreshTables() {
  var $comparison = $('#comparison');
  var selected = $comparison.find('input[type="checkbox"]:checked').map(function(_, input) {
    var $input = $(input);
    return {
      candidate_id: $input.attr('data-id'),
      candidate_name: $input.attr('data-name')
    };
  });
  if (selected.length > 0) {
    drawSizeTable(selected);
    drawStateTable(selected);
    drawTypeTable(selected);
  }
}

function drawComparison(results) {
  _.each(_.first(results, 10), function(result) {
    result._checked = true;
  });
  var $comparison = $('#comparison');
  $comparison.html(comparisonTemplate(results));
  $comparison.on('change', 'input[type="checkbox"]', refreshTables);
  refreshTables();
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

function mapType(response, primary) {
  var groups = {};
  var typeMap = {
    true: 'individual',
    false: 'committee'
  };
  _.each(response.results, function(result) {
    groups[result.candidate_id] = groups[result.candidate_id] || {};
    groups[result.candidate_id][typeMap[result.individual]] = result.total;
  });
  return _.map(_.pairs(groups), function(pair) {
    return _.extend(
      pair[1], {
        candidate_id: pair[0],
        candidate_name: primary[pair[0]].candidate_name
      });
  });
}

var defaultOpts = {
  destroy: true,
  searching: false,
  serverSide: false,
  lengthChange: false,
  dom: '<"results-info meta-box results-info--top"lfrip>t<"results-info meta-box"ip>',
};

function destroyTable($table) {
  if ($.fn.dataTable.isDataTable($table)) {
    var api = $table.DataTable();
    api.clear();
    api.destroy();
  }
}

function buildUrl(selected, path) {
  var query = {
    cycle: context.election.cycle,
    candidate_id: _.pluck(selected, 'candidate_id')
  };
  return URI(API_LOCATION)
    .path([API_VERSION, path].join('/'))
    .addQuery(query)
    .addQuery({per_page: 0})
    .toString();
}

function drawSizeTable(selected) {
  var $table = $('table[data-type="by-size"]');
  var primary = _.object(_.map(selected, function(result) {
    return [result.candidate_id, result];
  }));
  $.getJSON(
    buildUrl(selected, 'schedules/schedule_a/by_size/by_candidate')
  ).done(function(response) {
    var data = mapSize(response, primary);
    $table.dataTable(_.extend({
      data: data,
      columns: sizeColumns,
      order: [[1, 'desc']]
    }, defaultOpts));
    tables.barsAfterRender(null, $table.DataTable());
  });
}

function drawStateTable(selected) {
  var $table = $('table[data-type="by-state"]');
  var primary = _.object(_.map(selected, function(result) {
    return [result.candidate_id, result];
  }));
  $.getJSON(
    buildUrl(selected, 'schedules/schedule_a/by_state/by_candidate')
  ).done(function(response) {
    destroyTable($table);
    // Clear headers
    $table.find('thead').html('');
    var data = mapState(response, primary);
    $table.dataTable(_.extend({
      data: data,
      columns: stateColumns(selected),
      order: [[1, 'desc']]
    }, defaultOpts));
    tables.barsAfterRender(null, $table.DataTable());
    // Populate headers with correct text
    var headerLabels = ['State'].concat(_.pluck(selected, 'candidate_name'));
    $table.find('th').each(function(index, elm) {
      $(elm).text(headerLabels[index]);
    });
  });
}

function drawTypeTable(selected) {
  var $table = $('table[data-type="by-type"]');
  var primary = _.object(_.map(selected, function(result) {
    return [result.candidate_id, result];
  }));
  $.getJSON(
    buildUrl(selected, 'schedules/schedule_a/by_contributor_type/by_candidate')
  ).done(function(response) {
    var data = mapType(response, primary);
    $table.dataTable(_.extend({
      data: data,
      columns: typeColumns,
      order: [[1, 'desc']]
    }, defaultOpts));
    tables.barsAfterRender(null, $table.DataTable());
  });
}

function drawStateMap($container, candidateId, cached) {
  var url = URI(API_LOCATION)
    .path([
      API_VERSION,
      'schedules',
      'schedule_a',
      'by_state',
      'by_candidate'
    ].join('/'))
    .query({
      cycle: context.election.cycle,
      candidate_id: candidateId,
      per_page: 99
    })
    .toString();
  var $map = $container.find('.state-map-choropleth');
  $map.html('');
  $.getJSON(url).done(function(data) {
    var results = _.reduce(
      data.results,
      function(acc, val) {
        acc[val.state_full] = val.total;
        return acc;
      },
      {}
    );
    cached[candidateId] = results;
    updateColorScale($container, cached);
    var max = mapMax(cached);
    maps.stateMap($map, data, 400, 300, max, false);
  });
}

function mapMax(cached) {
  return _.chain(cached)
    .map(function(value, key) {
      return _.max(_.values(value));
    })
    .max()
    .value();
}

function appendStateMap($parent, results, cached) {
  var ids = _.pluck(results, 'candidate_id');
  var displayed = $parent.find('.state-map select').map(function(_, select) {
    return $(select).val();
  }).get();
  var value = _.find(ids, function(each) {
    return displayed.indexOf(each) === -1;
  }) || _.last(ids);
  $parent.append(candidateStateMapTemplate(results));
  var $select = $parent.find('.state-map:last select');
  $select.val(value);
  $select.trigger('change');
  updateButtonsDisplay($parent);
  updateColorScale($parent, cached);
}

function updateButtonsDisplay($parent) {
  var display = $parent.find('.state-map').length > 1 ? 'block' : 'none';
  $parent.find('.state-map button').css('display', display);
}

function updateColorScale($container, cached) {
  $container = $container.closest('#state-maps');
  var displayed = $container.find('.state-map select').map(function(_, select) {
    return $(select).val();
  }).get();
  _.each(_.keys(cached), function(key) {
    if (displayed.indexOf(key) === -1) {
      delete cached[key];
    }
  });
  var max = mapMax(cached);
  var scale = chroma.scale(['#fff', '#2678BA']).domain([0, max]);
  var quantize = chroma.scale(['#fff', '#2678BA']).domain([0, max], 4);
  $container.closest('#state-maps').find('.state-map').each(function(_, elm) {
    var $elm = $(elm);
    var results = cached[$elm.find('select').val()];
    d3.select($elm.find('g')[0])
      .selectAll('path')
      .attr('fill', function(d) {
        return scale(results[d.properties.name] || 0);
      });
  });
  $container.find('.legend svg g').remove();
  var svg = d3.select($container.get(0)).select('.legend svg');
  if (isFinite(max)) {
    maps.stateLegend(svg, scale, quantize, 4);
  }
}

function initStateMaps(results) {
  var cached = {};
  var $stateMaps = $('#state-maps');
  var $choropleths = $stateMaps.find('.choropleths');
  $stateMaps.find('.add-map').on('click', function(e) {
    appendStateMap($choropleths, results, cached);
  });
  $choropleths.on('change', 'select', function(e) {
    var $target = $(e.target);
    var $parent = $target.closest('.state-map');
    drawStateMap($parent, $target.val(), cached);
  });
  $choropleths.on('click', 'button', function(e) {
    var $target = $(e.target);
    var $parent = $target.closest('.state-map');
    var $container = $parent.closest('#state-maps');
    $parent.remove();
    updateButtonsDisplay($container);
    updateColorScale($container, cached);
  });
  $choropleths.find('.state-map').remove();
  appendStateMap($choropleths, results, cached);
}

function initSpendingTables() {
  var $table = $('table[data-type="independent-expenditures"]');
  var path = ['schedules', 'schedule_e'].join('/');
  tables.initTableDeferred($table, null, path, context.election, independentExpenditureColumns, tables.seekCallbacks, {
    // dom: singlePageTableDOM,
    order: [[0, 'desc']],
    pagingType: 'simple',
    lengthChange: false,
    pageLength: 10,
    useHideNull: false
  });
}

$(document).ready(function() {
  var $table = $('#results');
  var query = _.chain(context.election)
    .pairs()
    .filter(function(pair) {
      return pair[1];
    })
    .object()
    .value();
  var url = URI(API_LOCATION)
    .path([API_VERSION, 'elections'].join('/'))
    .addQuery(query)
    .addQuery({per_page: 0})
    .toString();
  $.getJSON(url).done(function(response) {
    $table.dataTable(_.extend({}, defaultOpts, {
      columns: columns,
      data: response.results,
      order: [[3, 'desc']]
    }));
    drawComparison(response.results);
    initStateMaps(response.results);
  });

  initSpendingTables();
});
