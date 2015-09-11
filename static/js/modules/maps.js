'use strict';

/* global require, module, window, document */

var d3 = require('d3');
var $ = require('jquery');
var _ = require('underscore');
var chroma = require('chroma-js');
var topojson = require('topojson');

var L = require('leaflet');
require('leaflet-providers');

var events = require('fec-style/js/events');

var helpers = require('./helpers');
var utils = require('./election-utils');

var states = require('../us.json');

var districts = require('../districts.json');
var districtFeatures = topojson.feature(districts, districts.objects.districts);

var stateFeatures = topojson.feature(states, states.objects.units).features;
var stateFeatureMap = _.chain(stateFeatures)
  .map(function(feature) {
    return [feature.properties.name, feature];
  })
  .object()
  .value();

var compactRules = [
  ['B', 9],
  ['M', 6],
  ['k', 3],
  ['', 0]
];

var colorScale = ['#fff', '#36BDBB'];

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

function chooseRule(value) {
  return _.find(compactRules, function(rule) {
    return value >= Math.pow(10, rule[1]);
  });
}

function compactNumber(value, rule) {
  var divisor = Math.pow(10, rule[1]);
  return d3.round(value / divisor, 1).toString() + rule[0];
}

function stateMap($elm, data, width, height, max, addLegend, addTooltips) {
  var svg = d3.select($elm[0])
    .append('svg')
      .attr('width', width)
      .attr('height', height);
  var projection = d3.geo.albersUsa()
    .scale(450)
    .translate([220, 150]);
  var path = d3.geo.path().projection(projection);

  var results = _.reduce(
    data.results,
    function(acc, val) {
      acc[val.state_full] = val.total;
      return acc;
    },
    {}
  );
  var quantiles = 4;
  max = max || _.max(_.pluck(data.results, 'total'));
  var scale = chroma.scale(colorScale).domain([0, max]);
  var quantize = d3.scale.linear().domain([0, max]);
  var map = svg.append('g')
    .selectAll('path')
      .data(stateFeatures)
    .enter().append('path')
      .attr('fill', function(d) {
        return scale(results[d.properties.name] || 0);
      })
      .attr('data-state', function(d) {
        return d.properties.name;
      })
      .attr('class', 'shape')
      .attr('d', path)
    .on('mouseover', function(d) {
      if (results[d.properties.name]) {
        this.parentNode.appendChild(this);
        this.classList.add('state--hover');
      }
    });

  if (addLegend || typeof addLegend === 'undefined') {
    var legendSVG = d3.select('.legend-container svg');
    stateLegend(legendSVG, scale, quantize, quantiles);
  }

  if (addTooltips) {
    stateTooltips(svg, path, results);
  }
}

function stateLegend(svg, scale, quantize, quantiles) {
  // Add legend swatches
  var legendWidth = 40;
  var legendBar = 35;
  var ticks = quantize.ticks(quantiles);
  var legend = svg.selectAll('g.legend')
    .data(ticks)
    .enter()
      .append('g')
      .attr('class', 'legend');
  legend.append('rect')
    .attr('x', function(d, i) {
      return i * legendWidth + (legendWidth - legendBar) / 2;
    })
    .attr('y', 0)
    .attr('width', legendBar)
    .attr('height', 20)
    .style('fill', function(d) {
      return scale(d);
    });

  // Add legend text
  var compactRule = chooseRule(ticks[Math.floor(quantiles / 2)]);
  legend.append('text')
    .attr('x', function(d, i) {
      return (i + 0.5) * legendWidth;
    })
    .attr('y', 30)
    .attr('width', legendWidth)
    .attr('height', 20)
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return compactNumber(d, compactRule);
    });
}

var tooltipTemplate = _.template(
  '<div class="tooltip__title">{{ name }}</div>' +
  '<div class="tooltip__value">{{ total }}</div>'
);

function stateTooltips(svg, path, results) {
  var tooltip = d3.select('body').append('div')
    .attr('id', 'map-tooltip')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('display', 'none');
  svg.selectAll('path')
    .on('mouseover', function(d) {
      this.parentNode.appendChild(this);
      var offset = $(this).offset();
      var html = tooltipTemplate({
        name: d.properties.name,
        total: helpers.currency(results[d.properties.name])
      });
      tooltip
        .style('display', 'block')
        .style('left', parseInt(offset.left) + 'px')
        .style('top', parseInt(offset.top) + 'px')
        .html(html);
    })
    .on('mouseout', function(d) {
      tooltip.style('display', 'none');
    });
}

function highlightState($parent, state) {
  var rule = '[data-state="' + state + '"]';
  $parent.find('path:not(' + rule + ')').each(function(idx, elm) {
    elm.classList.remove('active');
  });
  var $path = $parent.find('path' + rule);
  if ($path.length) {
    $path[0].classList.add('active');
  }
}

function DistrictMap(elm, style) {
  this.elm = elm;
  this.style = style;
  this.map = null;
  this.overlay = null;
}

DistrictMap.prototype.load = function(election) {
  var feature;
  if (election.district) {
    var encoded = utils.encodeDistrict(election.state, election.district);
    feature = utils.findDistrict(encoded);
  } else {
    feature = stateFeatureMap[election.stateFull];
  }
  feature && this.render(feature);
};

DistrictMap.prototype.render = function(data) {
  this.elm.setAttribute('aria-hidden', 'false');
  this.map = L.map(this.elm);
  L.tileLayer.provider('Stamen.TonerLite').addTo(this.map);
  this.overlay = L.geoJson(data, {style: this.style}).addTo(this.map);
  this.map.fitBounds(this.overlay.getBounds());
};

module.exports = {
  stateMap: stateMap,
  colorScale: colorScale,
  stateLegend: stateLegend,
  highlightState: highlightState,
  DistrictMap: DistrictMap
};
