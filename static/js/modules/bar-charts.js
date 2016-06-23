'use strict';

/* global module */
var $ = require('jquery');
var helpers = require('./helpers');
var d3 = require('d3');

var stripes =
  '<svg width="10px" height="10px" viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      '<defs>' +
        '<pattern id="stripes" patternUnits="userSpaceOnUse" width="10" height="10">' +
            '<path stroke="#979797" d="M-1.5,-1.5 L10.0108643,10.0108643" id="Line"></path>' +
        '</pattern>' +
      '</defs>' +
  '</svg>';


function GroupedBarChart(selector, data, index) {
  this.element = d3.select(selector);
  this.data = data;
  this.index = index;

  this.margin = {top: 0, right: 20, bottom: 50, left: 40};
  this.height = 320 - this.margin.top - this.margin.bottom;
  this.width = 500 - this.margin.left - this.margin.right;

  if ($('#stripes').length === 0) {
    $('body').append(stripes);
  }

  this.chart = this.buildChart();
  this.tooltip = this.appendTooltip();
}

GroupedBarChart.prototype.buildChart = function() {
  var data = this.data;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, this.width], 0.3);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
      .range([this.height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .innerTickSize([10])
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

  var entityNames = d3.keys(data[0])
    .filter(function(key) {
      return key !== 'period' && key !== 'status';
    });

  data.forEach(function(d) {
    d.entities = entityNames.map(function(name) {
      return {name: name, value: +d[name]};
    });
  });

  x0.domain(data.map(function(d) {
    return d.period;
  }));

  x1.domain(entityNames).rangeRoundBands([0, x0.rangeBand()], 0.2);
  y.domain([0, d3.max(data, function(d) {
    return d3.max(d.entities, function(d) {
      return d.value; });
  })]);

  var xg = svg.append('g')
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

  xg.selectAll('text')
    .html(function() {
      return this.textContent.replace(/^(.+), (\d{4})$/, '<tspan>$1</tspan><tspan>$2</tspan>');
    })
    .select('tspan:nth-child(2)')
    .attr('x', 0)
    .attr('dy', '1.5em');

  var periods = svg.selectAll('.period')
      .data(data)
    .enter()
      .append('g')
      .attr('class', function(d) { return 'period ' + d.status; })
      .attr('aria-labelledby', 'bar-chart-tooltip')
      .attr('transform', function(d) { return 'translate(' + x0(d.period) + ',0)'; })
      .attr('tabindex', '0')
      .on('focus', this.showTooltip.bind(this, x0))
      .on('blur', this.hideTooltip.bind(this))
      .on('mouseenter', this.showTooltip.bind(this, x0))
      .on('mouseleave', this.hideTooltip.bind(this));

  var periodsWithData = periods.filter(function(d) {
   return d.status === 'complete' || d.status === 'in-progress';
  });

  var emptyperiods = periods.filter(function(d) {
    return d.status === 'not-started';
  });

  // Assign to a variable so it can be used in callbacks
  var height = this.height;

  periodsWithData
      .selectAll('.bar')
      .data(function(d) {
        return d.entities;
      })
    .enter()
      .append('rect')
      .attr('class', function(d) {
        return 'bar ' + d.name;
      })
      .attr('y', height)
      .attr('height', 0)
      .attr('width', x1.rangeBand())
      .attr('x', function(d) { return x1(d.name); })
      .transition()
        .duration(1000)
        .attr('height', function(d) {
          var barHeight = height - y(d.value);
          return barHeight;
        })
        .attr('y', function(d) { return y(d.value); });

  periodsWithData.filter(function(d) { return d.status === 'in-progress'; })
    .selectAll('.bar--in-progress')
    .data(function(d) {
      return d.entities;
    })
    .enter()
      .append('rect')
      .attr('class', 'bar--in-progress')
      .attr('y', height)
      .attr('height', 0)
      .attr('width', x1.rangeBand())
      .attr('x', function(d) { return x1(d.name); })
      .transition()
        .duration(1000)
        .attr('height', function(d) {
          var barHeight = height - y(d.value);
          return barHeight;
        })
        .attr('y', function(d) { return y(d.value); });

  periodsWithData.insert('rect', '.bar')
    .attr('class', 'bar-bg')
    .attr('width', x1.rangeBand() * 4)
    .attr('height', this.height)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer');

  emptyperiods.selectAll('rect')
      .data(data)
      .enter()
        .append('rect')
        .attr('class', 'bar--empty')
        .attr('width', x1.rangeBand() * 4)
        .attr('x', function(d) { return x1(d.name); })
        .attr('y', 0)
        .attr('height', this.height);

  return svg;
};

GroupedBarChart.prototype.appendTooltip = function() {
  return this.element
    .style({'position': 'relative'})
    .append('div')
    .attr('class', 'tooltip tooltip--under tooltip--chart')
    .attr('id', 'bar-chart-tooltip-' + this.index);
};

GroupedBarChart.prototype.populateTooltip = function(d) {
  var entityDisplayNames = {
    'candidates': 'Candidates',
    'parties': 'Party committees',
    'pacs': 'PACs',
    'other': 'Other'
  };
  var totalAmount = 0;
  var total = '';
  var title = '';
  var list = '';

  if (d.status !== 'not-started') {
    d.entities.forEach(function(datum) {
      totalAmount += datum.value;
      var value = helpers.currency(datum.value);
      list += '<li class="figure__item">' +
        '<span class="t-inline-block">' +
          '<span class="swatch ' + datum.name + '"></span>' +
          entityDisplayNames[datum.name] +
        '</span>' +
        '<span class="t-inline-block">' +
          '<span class="figure__decimals" aria-hidden="true"></span>' +
          value +
        '</span>' +
      '</li>';
    });

    totalAmount = helpers.currency(totalAmount);

    total = '<li class="figure__item t-bold">' +
      '<span class="t-inline-block">Total</span>' +
      '<span class="t-inline-block">' +
        '<span class="figure__decimals"></span>' +
          totalAmount +
      '</span>' +
      '</li>';

    title = d.status === 'in-progress' ? d.period + ': In progress' : d.period;
  } else {
    title = d.period + ': Not started</span>';
  }


  return '<div class="tooltip__content figure--zero-pad">' +
    '<span class="tooltip__title t-block">' + title + '</span>' +
    '<ul>' +
      total +
      list +
    '</ul>' +
    '</div>';
};

GroupedBarChart.prototype.showTooltip = function(x0, d) {
  var top = this.height + this.margin.top + this.margin.bottom;
  var left = x0(d.period);
  var content = this.populateTooltip(d);

  this.tooltip
    .style({
      'display': 'block',
      'top': top.toString() + 'px',
      'left': left.toString() + 'px'
    })
    .html(content);

  helpers.zeroPad('.tooltip__content', '.figure__item', '.figure__decimals');

};

GroupedBarChart.prototype.hideTooltip = function() {
  this.tooltip.style({'display': 'none'});
};

module.exports = {
  GroupedBarChart: GroupedBarChart
};
