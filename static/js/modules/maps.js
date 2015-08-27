'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var d3 = require('d3');
var $ = require('jquery');
var _ = require('underscore');
var chroma = require('chroma-js');
var topojson = require('topojson');

var L = require('leaflet');
require('leaflet-providers');

var events = require('fec-style/js/events');

var helpers = require('./helpers');
var states = require('../us.json');

var compactRules = [
  ['B', 9],
  ['M', 6],
  ['k', 3]
];

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
  var scale = chroma.scale(['#fff', '#2678BA']).domain([0, max]);
  var quantize = chroma.scale(['#fff', '#2678BA']).domain([0, max], quantiles);
  var map = svg.append('g')
    .selectAll('path')
      .data(topojson.feature(states, states.objects.units).features)
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
      this.parentNode.appendChild(this);
    });

  if (addLegend || typeof addLegend === 'undefined') {
    stateLegend(svg, scale, quantize, quantiles);
  }

  if (addTooltips) {
    stateTooltips(svg, path, results);
  }
}

function stateLegend(svg, scale, quantize, quantiles) {
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
}

var tooltipTemplate = _.template(
  '<div>{{ name }}</div>' +
  '<div>{{ total }}</div>'
);

function stateTooltips(svg, path, results) {
  var tooltip = d3.select('body').append('div')
    .attr('id', 'map-tooltip')
    .style('position', 'absolute')
    .style('text-align', 'center')
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

var districtUrl = '/static/json/districts';

function DistrictMap(elm) {
  this.elm = elm;
  this.map = null;
}

DistrictMap.prototype.load = function(state, district) {
  var url = [districtUrl, state, district].join('/') + '.geojson';
  $.getJSON(url).done(this.render.bind(this));
};

DistrictMap.prototype.render = function(data) {
  var centroid = d3.geo.centroid(data);
  this.map = L.map(this.elm).setView([centroid[1], centroid[0]], 10);
  L.tileLayer.provider('Stamen.TonerLite').addTo(this.map);
  L.geoJson(data).addTo(this.map);
};

module.exports = {
  stateMap: stateMap,
  stateLegend: stateLegend,
  highlightState: highlightState,
  DistrictMap: DistrictMap
};
