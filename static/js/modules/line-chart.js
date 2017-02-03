'use strict';

/* global module */
var $ = require('jquery');
var _ = require('underscore');
var d3 = require('d3');
var numeral = require('numeral');
var helpers = require('./helpers');

var parseM = d3.time.format('%b');
var parseMY = d3.time.format('%b %Y');
var parseMDY = d3.time.format('%b %e, %Y');

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

  if (helpers.isMediumScreen()) {
    this.$snapshot.height(this.baseHeight - this.margin.bottom);
  }

  this.moveCursor(this.data[this.data.length - 1]);

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

  var entityNames = ['candidate', 'party', 'pac'];

  // Create different objects for each entity type
  entityNames.forEach(function(type) {
    var totals = data.map(function(d) {
      return {
        date: d.date,
        amount: d[type] || 0
      };
    });

    var entityMax = d3.max(totals, function(d) {
      return d.amount;
    });

    max = Math.max(entityMax, max);
    entityTotals[type] = totals;
  });

  var minYear = window.DEFAULT_TIME_PERIOD - 1;
  var maxYear = window.DEFAULT_TIME_PERIOD;
  var maxY = function() {
    return 1000000000;
  };

  // Build the scales
  var x = d3.time.scale()
    .domain([new Date('01/01/' + minYear), new Date('12/31/' + maxYear)])
    .nice(d3.time.month)
    .range([0, this.width]);

  var y = d3.scale.linear()
      .domain([0, Math.ceil(max / maxY) * maxY])
      .range([this.height, 0]);

  var xAxis = d3.svg.axis().scale(x);

  this.formatXAxis(xAxis);

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

LineChart.prototype.formatXAxis = function(axis) {
  var formatter;
  if (helpers.isMediumScreen()) {
    formatter = function(d) {
      if (d.getMonth() === 0) {
        return parseMY(d);
      } else if (d.getMonth() % 2 === 0) {
        return parseM(d);
      } else {
        return '';
      }
    };
  } else {
    formatter = function(d) {
      if (d.getMonth() === 0) {
        return parseMY(d);
      } else if (d.getMonth() % 4 === 0) {
        return parseM(d);
      } else {
        return '';
      }
    };
  }

  axis.ticks(d3.time.month)
    .tickFormat(formatter)
    .orient('bottom');
};

LineChart.prototype.handleMouseMove = function() {
  var svg = this.element.select('svg')[0][0];

  var x0 = this.x.invert(d3.mouse(svg)[0]),
    i = bisectDate(this.data, x0, 1),
    d = this.data[i - 1];
  this.moveCursor(d);
};

LineChart.prototype.moveCursor = function(datum) {
  var i = this.data.indexOf(datum);
  this.cursor.attr('x1', this.x(datum.date)).attr('x2', this.x(datum.date));
  this.nextDatum = this.data[i+1];
  this.prevDatum = this.data[i-1];
  this.populateSnapshot(datum);
  this.element.selectAll('.line__points circle')
    .attr('r', 2)
    .filter(function(d) {
      return d.date === datum.date;
    })
    .attr('r', 4);
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

  this.$snapshot.find('.js-date').html(parseMDY(d.date));
  helpers.zeroPad(this.$snapshot, '.snapshot__item-number', '.figure__decimals');
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
