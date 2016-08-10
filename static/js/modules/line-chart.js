'use strict';

/* global module */
var $ = require('jquery');
var d3 = require('d3');

function LineChart(selector, data, index) {
  this.element = d3.select(selector);
  this.data = data;
  this.index = index;

  this.margin = {top: 0, right: 20, bottom: 50, left: 40};
  this.baseWidth = $(selector).width();
  this.baseHeight = this.baseWidth * 0.7;
  this.height = this.baseHeight - this.margin.top - this.margin.bottom;
  this.width = this.baseWidth - this.margin.left - this.margin.right;

  this.chart = this.buildChart();
}

// {
//   'date': '6/30/2016',
//   'candidates': 2136103644.63,
//   'pacs': 2493168873.62,
//   'party': 953722512.3
// },

LineChart.prototype.buildChart = function() {
  var data = this.data;
  var entityTotals = {};
  var max = 0;

  // Transform the data
  var entityNames = d3.keys(data[0])
    .filter(function(key) {
      return key !== 'date';
    });

  // Create different objects for each entity type
  entityNames.forEach(function(type) {
    var totals = data.map(function(d) {
      return {
        date: new Date(d.date),
        amount: d[type]
      };
    });

    var entityMax = d3.max(totals, function(d) {
      return d.amount;
    });

    max = entityMax > max ? entityMax : max;
    entityTotals[type] = totals;
  });

  // Build the scales
  var x = d3.time.scale()
    .domain(d3.extent(data, function(d) {
      return new Date(d.date);
    }))
    .nice(d3.time.month)
    .range([0, this.width]);

  var y = d3.scale.linear()
      .domain([0, max])
      .range([this.height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.month, 3)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('right')
      .tickSize(this.width)
      .tickFormat(d3.format('$s'));

  var svg = this.element.append('svg')
      .attr('class', 'bar-chart')
      .attr('width', '100%')
      .attr('height', this.height + this.margin.top + this.margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(xAxis);

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .selectAll('text')
        .attr('y', -4)
        .attr('x', -4)
        .attr('dy', '.71em')
        .style('text-anchor', 'end');

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.amount); });

  entityNames.forEach(function(entity) {
    svg.append('path')
      .attr('class', 'line ' + 'line--' + entity)
      .datum(entityTotals[entity])
      .attr('d', line)
      .attr('stroke-width', 2)
      .attr('fill', 'none');
  });

};

module.exports = {
  LineChart: LineChart
};
