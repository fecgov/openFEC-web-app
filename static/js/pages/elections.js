'use strict';

/* global require, module, window, document, context */

var d3 = require('d3');
var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var chroma = require('chroma-js');

var dropdown = require('fec-style/js/dropdowns');

var maps = require('../modules/maps');
var tables = require('../modules/tables');
var columns = require('../modules/columns');
var helpers = require('../modules/helpers');

var comparisonTemplate = require('../../templates/comparison.hbs');
var candidateStateMapTemplate = require('../../templates/candidateStateMap.hbs');

var MAX_MAPS = 2;

var independentExpenditureColumns = [
  tables.currencyColumn({data: 'total', className: 'all'}),
  tables.committeeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn,
  tables.candidateColumn({data: 'candidate', className: 'all'}),
];

var communicationCostColumns = [
  tables.currencyColumn({data: 'total', className: 'all'}),
  tables.committeeColumn({data: 'committee', className: 'all'}),
  columns.supportOpposeColumn,
  tables.candidateColumn({data: 'candidate', className: 'all'})
];

var electioneeringColumns = [
  tables.currencyColumn({data: 'total', className: 'all'}),
  tables.committeeColumn({data: 'committee', className: 'all'}),
  tables.candidateColumn({data: 'candidate', className: 'all'})
];

var electionColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(
        data,
        '/candidate/' + row.candidate_id,
        'candidate',
        {isIncumbent: row.incumbent_challenge_full === 'Incumbent'}
      );
    }
  },
  {data: 'party_full', className: 'all'},
  {
    data: 'total_receipts',
    orderSequence: ['desc', 'asc'],
    render: tables.buildTotalLink('/receipts', function(data, type, row, meta) {
      return {
        committee_id: row.committee_ids,
        cycle: context.election.cycle
      };
    })
  },
  {
    data: 'total_disbursements',
    orderSequence: ['desc', 'asc'],
    render: tables.buildTotalLink('/disbursements', function(data, type, row, meta) {
      return {
        committee_id: row.committee_ids,
        cycle: context.election.cycle
      };
    })
  },
  tables.barCurrencyColumn({data: 'cash_on_hand_end_period'}),
  tables.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false})
];

function makeCommitteeColumn(opts, factory) {
  return _.extend({}, {
    orderSequence: ['desc', 'asc'],
    render: tables.buildTotalLink('/receipts', function(data, type, row, meta) {
      var column = meta.settings.aoColumns[meta.col].data;
      return _.extend({
        committee_id: (context.candidates[row.candidate_id] || {}).committee_ids,
        cycle: context.election.cycle
      }, factory(data, type, row, meta, column));
    })
  }, opts);
}

var makeSizeColumn = _.partial(makeCommitteeColumn, _, function(data, type, row, meta, column) {
  var limits = columns.sizeInfo[column].limits;
  return {
    min_amount: limits[0],
    max_amount: limits[1],
    is_individual: 'true'
  };
});

var makeTypeColumn = _.partial(makeCommitteeColumn, _, function(data, type, row, meta, column) {
  return {contributor_type: column};
});

var sizeColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  makeSizeColumn({data: '0'}),
  makeSizeColumn({data: '200'}),
  makeSizeColumn({data: '500'}),
  makeSizeColumn({data: '1000'}),
  makeSizeColumn({data: '2000'})
];

var typeColumns = [
  {
    data: 'candidate_name',
    className: 'all',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(data, '/candidate/' + row.candidate_id, 'candidate');
    }
  },
  makeTypeColumn({data: 'individual'}),
  makeTypeColumn({data: 'committee'})
];

var stateColumn = {'data': 'state'};
function stateColumns(results) {
  var columns = _.map(results, function(result) {
    return makeCommitteeColumn(
      {data: result.candidate_id},
      function(data, type, row, meta, column) {
        return {
          contributor_state: row.state,
          committee_id: (context.candidates[column] || {}).committee_ids,
          is_individual: 'true'
        };
      }
    );
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
  var $comparison = $('#comparison');
  var context = {selected: results.slice(0, 10), options: results.slice(10)};
  $comparison.prepend(comparisonTemplate(context));
 new dropdown.Dropdown($comparison.find('.js-dropdown'));
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
  dom: tables.simpleDOM,
  pagingType: 'simple'
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
    candidate_id: _.pluck(selected, 'candidate_id'),
    per_page: 0
  };
  return helpers.buildUrl(path, query);
}

function drawSizeTable(selected) {
  var $table = $('table[data-type="by-size"]');
  var primary = _.object(_.map(selected, function(result) {
    return [result.candidate_id, result];
  }));
  $.getJSON(
    buildUrl(selected, ['schedules', 'schedule_a', 'by_size', 'by_candidate'])
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
    buildUrl(selected, ['schedules', 'schedule_a', 'by_state', 'by_candidate'])
  ).done(function(response) {
    var data = mapState(response, primary);
    // Populate headers with correct text
    var headerLabels = ['State'].concat(_.pluck(selected, 'candidate_name'));
    $table.find('thead tr')
      .empty()
      .append(_.map(headerLabels, function(label) {
        return $('<th>').text(label);
      }));
    destroyTable($table);
    $table.dataTable(_.extend({
      data: data,
      columns: stateColumns(selected),
      order: [[1, 'desc']]
    }, defaultOpts));
    tables.barsAfterRender(null, $table.DataTable());
  });
}

function drawTypeTable(selected) {
  var $table = $('table[data-type="by-type"]');
  var primary = _.object(_.map(selected, function(result) {
    return [result.candidate_id, result];
  }));
  $.getJSON(
    buildUrl(selected, ['schedules', 'schedule_a', 'by_contributor_type', 'by_candidate'])
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
  var url = helpers.buildUrl(
    ['schedules', 'schedule_a', 'by_state', 'by_candidate'],
    {cycle: context.election.cycle, candidate_id: candidateId, per_page: 99}
  );
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
    var min = mapMin(cached);
    var max = mapMax(cached);
    maps.stateMap($map, data, 400, 300, min, max, false, true);
  });
}

function mapMin(cached) {
  return _.chain(cached)
    .map(function(value, key) {
      return _.chain(value)
        .values()
        .filter(function(value) {
          return !!value;
        })
        .min()
        .value();
    })
    .min()
    .value();
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
  var displayed = $parent.find('.candidate-select').map(function(_, select) {
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
  var $maps = $parent.find('.state-map');
  var showAdd = $maps.length < MAX_MAPS ? 'block' : 'none';
  var showRemove = $maps.length > 1 ? 'block' : 'none';
  $parent.find('.js-add-map').css('display', showAdd);
  $parent.find('.js-remove-map').css('display', showRemove);
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
  var min = mapMin(cached);
  var max = mapMax(cached);
  var scale = chroma.scale(maps.colorScale).domain([min, max]);
  var quantize = d3.scale.linear().domain([min, max]);
  $container.find('.state-map').each(function(_, elm) {
    var $elm = $(elm);
    var results = cached[$elm.find('select').val()];
    d3.select($elm.find('g')[0])
      .selectAll('path')
      .attr('fill', function(d) {
        return scale(results[d.properties.name] || 0);
      });
  });
  $container.find('.legend-container svg g').remove();
  var svg = d3.select($container.get(0)).select('.legend-container svg');
  if (isFinite(max)) {
    maps.stateLegend(svg, scale, quantize, 4);
  }
}

function initStateMaps(results) {
  var cached = {};
  var $stateMaps = $('#state-maps');
  var $choropleths = $stateMaps.find('.choropleths');
  appendStateMap($choropleths, results, cached);
  $choropleths.on('change', 'select', function(e) {
    var $target = $(e.target);
    var $parent = $target.closest('.state-map');
    drawStateMap($parent, $target.val(), cached);
  });
  $choropleths.on('click', '.js-add-map', function(e){
    appendStateMap($choropleths, results, cached);
  })
  $choropleths.on('click', '.js-remove-map', function(e) {
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

var tableOpts = {
  'independent-expenditures': {
    path: ['schedules', 'schedule_e', 'by_candidate'],
    columns: independentExpenditureColumns
  },
  'communication-costs': {
    path: ['communication_costs', 'by_candidate'],
    columns: communicationCostColumns
  },
  'electioneering': {
    path: ['electioneering_costs', 'by_candidate'],
    columns: electioneeringColumns
  },
};

function initSpendingTables() {
  $('.data-table').each(function(index, table) {
    var $table = $(table);
    var dataType = $table.attr('data-type');
    var opts = tableOpts[dataType];
    if (opts) {
      tables.initTableDeferred($table, null, opts.path, helpers.filterNull(context.election), opts.columns, tables.offsetCallbacks, {
        order: [[0, 'desc']],
        dom: tables.simpleDOM,
        pagingType: 'simple',
        lengthChange: false,
        pageLength: 10,
        useHideNull: false
      });
    }
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
  var url = helpers.buildUrl(
    ['elections'],
    _.extend(query, {per_page: 0})
  );
  $.getJSON(url).done(function(response) {
    $table.dataTable(_.extend({}, defaultOpts, {
      columns: electionColumns,
      data: response.results,
      order: [[2, 'desc']]
    }));
    drawComparison(response.results);
    initStateMaps(response.results);
    context.candidates = _.chain(response.results)
      .map(function(candidate) {
        return [candidate.candidate_id, candidate];
      })
      .object()
      .value();
    });

  var districtMap = new maps.DistrictMap(
    $('#election-map').get(0),
    {color: '#36BDBB'}
  );
  districtMap.load(context.election);

  initSpendingTables();
});
