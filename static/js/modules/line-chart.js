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
//   'month': 'Jan 2015',
//   'candidates': '',
//   'parties': '',
//   'pacs': '',
//   'other': ''
// },

LineChart.prototype.buildChart = function() {
  var data = this.data;

  // var x = d3.scaleTime().range([0, this.width]),
  //     y = d3.scaleLinear().range([this.height, 0]),
  //     z = d3.scaleOrdinal(d3.schemeCategory10);

  // var line = d3.line()
  //     .x(function(d) { return x(d.month); })
  //     .y(function(d) { return y(d.amount); });

  var entityNames = d3.keys(data[0])
    .filter(function(key) {
      return key !== 'month';
    });

  data.forEach(function(d) {
    console.log(d);
  });

};

module.exports = {
  LineChart: LineChart
};
