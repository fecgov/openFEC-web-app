'use strict';

/* global module */
var $ = require('jquery');
var _ = require('underscore');
var d3 = require('d3');
var numeral = require('numeral');
var helpers = require('./helpers');

var parseDate = d3.time.format('%b %Y');
var parseDateLong = d3.time.format('%b %d %Y');
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

function LineChart(selector, snapshot, data, index) {
  this.element = d3.select(selector);
  this.data = data;
  this.index = index;

  this.margin = {top: 10, right: 20, bottom: 30, left: 50};
  this.baseWidth = $(selector).width();
  this.baseHeight = this.baseWidth * 0.5;
  this.height = this.baseHeight - this.margin.top - this.margin.bottom;
  this.width = this.baseWidth - this.margin.left - this.margin.right;

  this.chart = this.buildChart();

  this.$snapshot = $(snapshot);
  this.$prev = this.$snapshot.find('.js-snapshot-prev');
  this.$next = this.$snapshot.find('.js-snapshot-next');

  this.element.on('mousemove', this.handleMouseMove.bind(this));
  this.$prev.on('click', this.goToPreviousMonth.bind(this));
  this.$next.on('click', this.goToNextMonth.bind(this));
}

LineChart.prototype.buildChart = function() {
  var data = this.data;
  var entityTotals = {};
  var max = 0;

  data.forEach(function(d) {
    d.date = new Date(d.date);
  });

  // Transform the data
  var entityNames = d3.keys(data[0])
    .filter(function(key) {
      return key !== 'date';
    });

  // Create different objects for each entity type
  entityNames.forEach(function(type) {
    var totals = data.map(function(d) {
      return {
        date: d.date,
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
      return d.date;
    }))
    .nice(d3.time.month)
    .range([0, this.width]);

  var y = d3.scale.linear()
      .domain([0, Math.ceil(max / 1000000000) * 1000000000])
      .range([this.height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.month)
      .tickFormat(function(d) {
        if (d.getMonth() % 2 === 0) {
          return parseDate(d);
        } else {
          return '';
        }
      })
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('right')
      .tickSize(this.width)
      .tickFormat(function(d) {
        return numeral(d).format('($0.0a)');
      });

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

  var lineBuilder = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.amount); });

  entityNames.forEach(function(entity) {
    var line = svg.append('g').attr('class', 'line--' + entity);
    var points = line.append('g').attr('class', 'line__points');

    line.append('path')
      .datum(entityTotals[entity])
      .attr('d', lineBuilder)
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    points.selectAll('circle')
      .data(entityTotals[entity])
      .enter()
      .append('circle')
      .attr('cx', function(d) {
          return x(d.date);
      })
      .attr('cy', function(d) { return y(d.amount); })
      .attr('r', 2);
  });

  this.cursor = svg.append('line')
    .attr('class', 'cursor')
    .attr('stroke-dasharray', '5,5')
    .attr('x1', 10).attr('x2', 10)
    .attr('y1', 0).attr('y2', this.height);

  this.x = x;
};

LineChart.prototype.handleMouseMove = function() {
  var svg = this.element.select('svg')[0][0];

  var x0 = this.x.invert(d3.mouse(svg)[0]),
    i = bisectDate(this.data, x0, 1),
    d0 = this.data[i - 1],
    d1 = this.data[i],
    d;
    if (d1) {
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    } else {
      d = d0;
    }
  this.currentDatum = d;
  this.prevDatum = d0;
  this.nextDatum = d1;
  this.moveCursor(d);
};

LineChart.prototype.moveCursor = function(d) {
  var i = this.data.indexOf(d);
  this.cursor.attr('x1', this.x(d.date)).attr('x2', this.x(d.date));
  this.nextDatum = this.data[i+1];
  this.prevDatum = this.data[i-1];
  this.populateSnapshot(d);
};

LineChart.prototype.populateSnapshot = function(d) {
  this.$snapshot.find('[data-total-for]').each(function() {
    var category = $(this).data('total-for');
    var value = helpers.currency(d[category]);
    $(this).html(value);
  });

  var total = _.chain(d)
    .omit('date')
    .values()
    .reduce(function(a, b) { return a + b; })
    .value();

  this.$snapshot.find('[data-total-for="all"]').html(helpers.currency(total));

  this.$snapshot.find('.js-date').html(parseDateLong(d.date));
  helpers.zeroPad(this.$snapshot, '.overview__total-number', '.figure__decimals');
};

LineChart.prototype.goToNextMonth = function() {
  var d = this.nextDatum ? this.nextDatum : this.data[1];
  this.moveCursor(d);
};

LineChart.prototype.goToPreviousMonth = function() {
  var d = this.prevDatum ? this.prevDatum : this.data[0];
  this.moveCursor(d);
};

module.exports = {
  LineChart: LineChart
};
