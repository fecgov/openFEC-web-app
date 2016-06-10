'use strict';

/* global module, d3 */
var helpers = require('./helpers');

function GroupedBarChart(selector, data) {
  this.element = d3.select(selector);
  this.data = data;

  this.margin = {top: 0, right: 20, bottom: 50, left: 40};
  this.height = 320 - this.margin.top - this.margin.bottom;
  this.width = 500 - this.margin.left - this.margin.right;

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

  var color = d3.scale.ordinal()
      .range(['#3e8a9a', '#d6d7d9','#36bdbb', '#5b616b']);

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
      .attr('class', 'bar')
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
        .attr('y', function(d) { return y(d.value); })
        .style({
          'cursor': 'pointer',
          'fill': function(d) { return color(d.name); }
        });

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
        .attr('width', x1.rangeBand() * 4)
        .attr('x', function(d) { return x1(d.name); })
        .attr('y', 0)
        .attr('height', this.height)
        .style('fill', '#ccc');

  return svg;
};

GroupedBarChart.prototype.appendTooltip = function() {
  return this.element
    .style({'position': 'relative'})
    .append('div')
    .attr('class', 'tooltip tooltip--under')
    .attr('id', 'tooltip');
};

GroupedBarChart.prototype.populateTooltip = function(d) {
  var statusMap = {
    'in-progress': 'In progress',
    'not-started': 'Not started'
  };
  var entityMap = {
    'candidates': 'Candidates',
    'parties': 'Party committees',
    'pacs': 'PACs',
    'other': 'Other'
  };
  var total = 0;
  var status = d.status !== 'complete' ? '<span>' + statusMap[d.status] + '</span>' : '';
  var list = '';

  if (d.status !== 'not-started') {
    d.entities.forEach(function(datum) {
      total += datum.value;
      var value = helpers.currency(datum.value);
      list += '<li>' + entityMap[datum.name] + ': ' + value + '</li>';
    });
  }

  total = helpers.currency(total);
  var title = '<span class="tooltip__title">' + d.period + ': ' + total + '</span>';

  return '<div class="tooltip__content">' +
    title +
    '<ul>' + list + '</ul>' +
    status + '</div>';
};

GroupedBarChart.prototype.showTooltip = function(x0, d) {
  var top = this.height + this.margin.top + this.margin.bottom;
  var left = x0(d.period);
  var content = this.populateTooltip(d);

  this.tooltip
    .style({'display': 'block'})
    .style({'top': top.toString() + 'px'})
    .style({'left': left.toString() + 'px'})
    .html(content);
};

GroupedBarChart.prototype.hideTooltip = function() {
  this.tooltip.style({'display': 'none'});
};

module.exports = {
  GroupedBarChart: GroupedBarChart
};
