'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var d3 = require('d3');
var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var chroma = require('chroma-js');
var topojson = require('topojson');

var events = require('./events');
var helpers = require('./helpers');
var states = require('../us.json');

var compactRules = [
  ['B', 9],
  ['M', 6],
  ['k', 3]
];

function chooseRule(value) {
  return _.find(compactRules, function(rule) {
    return value >= Math.pow(10, rule[1]);
  });
}

function compactNumber(value, rule) {
  var divisor = Math.pow(10, rule[1]);
  return d3.round(value / divisor, 1).toString() + rule[0];
}

function stateMap($elm, width, height) {
  var url = URI(API_LOCATION)
    .path([
      API_VERSION,
      'committee',
      $elm.data('committee-id'),
      'schedules',
      'schedule_a',
      'by_state'
    ].join('/'))
    .query({
      cycle: $elm.data('cycle'),
      per_page: 99
    })
    .toString();

  var svg = d3.select($elm[0])
    .append('svg')
      .attr('width', width)
      .attr('height', height);
  var projection = d3.geo.albersUsa()
    .scale(450)
    .translate([220, 250]);
  var path = d3.geo.path().projection(projection);

  d3.json(url, function(error, data) {
    var results = _.reduce(
      data.results,
      function(acc, val) {
        acc[val.state_full] = val.total;
        return acc;
      },
      {}
    );
    var max = _.max(_.pluck(data.results, 'total'));
    var scale = chroma.scale('RdYlBu').domain([0, max]);
    var quantize = chroma.scale('RdYlBu').domain([0, max], quantiles);
    var map = svg.append('g')
      .selectAll('path')
        .data(topojson.feature(states, states.objects.units).features)
      .enter().append('path')
        .attr('fill', function(d) {
          return scale(results[d.properties.name]);
        })
        .attr('data-state', function(d) {
          return d.properties.name;
        })
        .attr('class', 'shape')
        .attr('d', path);

    // Add legend swatches
    var legendWidth = 40;
    var legendBar = 35;
    var legend = svg.selectAll('g.legend')
      .data(quantize.domain())
      .enter()
        .append('g')
        .attr('class', 'legend');
    legend.append('rect')
      .attr('x', function(d, i) {
        return i * legendWidth + (legendWidth - legendBar) / 2;
      })
      .attr('y', 20)
      .attr('width', legendBar)
      .attr('height', 20)
      .style('fill', function(d) {
        return scale(d);
      });

    // Add legend text
    var quantiles = 7;
    var compactRule = chooseRule(quantize.domain()[Math.floor(quantiles / 2)]);
    legend.append('text')
      .attr('x', function(d, i) {
        return (i + 0.5) * legendWidth;
      })
      .attr('y', 50)
      .attr('width', legendWidth)
      .attr('height', 20)
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .text(function(d) {
        return compactNumber(d, compactRule);
      });
  });
}

function highlightState($parent, state) {
  var rule = '[data-state="' + state + '"]';
  $parent.find('path:not(' + rule + ')').each(function(idx, elm) {
    elm.classList.remove('active');
  });
  $parent.find('path' + rule)[0].classList.add('active');
}

function init() {
  $('.state-map').each(function(idx, elm) {
    var $elm = $(elm);
    stateMap($elm, 400, 400);
    events.on('state.table', function(params) {
      highlightState($elm, params.state);
    });
    $elm.on('click', 'path[data-state]', function(e) {
      var state = $(this).attr('data-state');
      highlightState($elm, state);
      events.emit('state.map', {state: state});
    });
  });
}

module.exports = {
  init: init,
  stateMap: stateMap
};
