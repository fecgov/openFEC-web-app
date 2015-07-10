'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var d3 = require('d3');
var $ = require('jquery');
var URI = require('URIjs');
var _ = require('underscore');
var chroma = require('chroma-js');
var topojson = require('topojson');

var helpers = require('./helpers');
var states = require('../states.json');

function hexMap($elm, height, width) {
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
  var projection = d3.geo.mercator()
    .scale(500)
    .translate([1280, 650]);
  var path = d3.geo.path().projection(projection);

  d3.json(url, function(error, data) {
    var results = _.reduce(
      data.results,
      function(acc, val) {
        acc[val.state] = val.total;
        return acc;
      },
      {}
    );
    var max = _.max(_.pluck(data.results, 'total'));
    var scale = chroma.scale('RdYlBu').domain([0, max]);
    var hex = svg.append('g')
      .selectAll('path')
        .data(topojson.feature(states, states.objects.collection).features)
      .enter().append('path')
        .attr('fill', function(d) {
          return scale(results[d.properties.iso3166_2]);
        })
        .attr('d', path);

    var labels = svg.selectAll('g.label')
      .data(topojson.feature(states, states.objects.collection).features)
      .enter()
      .append('g')
      .attr('class', 'label')
      .attr('transform', function(d) {
        return 'translate(' + projection(d3.geo.centroid(d)) + ')';
      })
      .append('text')
      .text(function(d) {
        return d.properties.iso3166_2;
      });

    hex.on('mouseover', function(d) {
      var xPosition = d3.mouse(this)[0];
      var yPosition = d3.mouse(this)[1] - 30;
      var total = results[d.properties.iso3166_2];
      svg.append('text')
        .attr('id', 'tooltip')
        .attr('x', xPosition)
        .attr('y', yPosition)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', 'black')
        .text(helpers.currency(total));
    })
    .on('mouseout', function(d) {
      d3.select('#tooltip').remove();
    });
  });
}

function init() {
  $('.hex-map').each(function(idx, elm) {
    var $elm = $(elm);
    hexMap($elm, 600, 800);
  });
}

module.exports = {
  init: init,
  hexMap: hexMap
};
