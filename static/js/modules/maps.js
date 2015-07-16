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

function hexMap($elm, width, height) {
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
    .scale(400)
    .translate([240, 250]);
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
    var hex = svg.append('g')
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

    // hex.on('mouseover', function(d) {
    //   var xPosition = d3.mouse(this)[0];
    //   var yPosition = d3.mouse(this)[1] - 30;
    //   var total = results[d.properties.iso3166_2];
    //   svg.append('text')
    //     .attr('id', 'map-tooltip')
    //     .attr('x', xPosition)
    //     .attr('y', yPosition)
    //     .attr('text-anchor', 'middle')
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '11px')
    //     .attr('font-weight', 'bold')
    //     .attr('fill', 'black')
    //     .text(helpers.currency(total));
    // })
    // .on('mouseout', function(d) {
    //   d3.select('#map-tooltip').remove();
    // });
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
  $('.hex-map').each(function(idx, elm) {
    var $elm = $(elm);
    hexMap($elm, 400, 400);
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
  hexMap: hexMap
};
