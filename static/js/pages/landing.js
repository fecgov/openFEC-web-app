'use strict';

/* global require */

var $ = require('jquery');

var GroupedBarChart = require('../modules/bar-charts').GroupedBarChart;
var TopList = require('../modules/top-list').TopList;
var helpers = require('../modules/helpers');

var raisingData = [
  {
    'period': 'Jan 1 - June 30, 2015',
    'status': 'complete',
    'candidates': 305427675.73,
    'parties': 217813182.16,
    'pacs': 680219721.08,
    'other': 7741.44,
  },
  {
    'period': 'Jul 1 - Dec 31, 2015',
    'status': 'complete',
    'candidates': 529603187.6,
    'parties': 209606697.26,
    'pacs': 584266359.97,
    'other': 19512.72
  },
  {
    'period': 'Jan 1 - Mar 31, 2016',
    'status': 'complete',
    'candidates': 432197566.98,
    'parties': 145682466.69,
    'pacs': 590005249.82,
    'other': 401526.89
  },
  {
    'period': 'Apr 1 - June 30, 2016',
    'status': 'in-progress',
    'candidates': 104196285.25,
    'parties': 53314363.39,
    'pacs': 359289.27,
    'other': 0
  },
  {
    'period': 'Jul 1 - Sep 30, 2016',
    'status': 'not-started',
    'candidates': 0,
    'parties': 0,
    'pacs': 0,
    'other': 0
  },
  {
    'period': 'Oct 1 - Dec 31, 2016',
    'status': 'not-started',
    'candidates': 0,
    'parties': 0,
    'pacs': 0,
    'other': 0
  }
];

var spendingData = [
  {
    'period': 'Jan 1 - June 30, 2015',
    'status': 'complete',
    'candidates': 305427675.73,
    'parties': 217813182.16,
    'pacs': 680219721.08,
    'other': 7741.44
  },
  {
    'period': 'Jul 1 - Dec 31, 2015',
    'status': 'complete',
    'candidates': 414159558.73,
    'parties': 173218529.69,
    'pacs': 259718445.04,
    'other': 5482220.81
  },
  {
    'period': 'Jan 1 - Mar 31, 2016',
    'status': 'complete',
    'candidates': 476623668.08,
    'parties': 102074951.47,
    'pacs': 307355510.41,
    'other': 23331535.6
  },
  {
    'period': 'Apr 1 - June 30, 2016',
    'status': 'in-progress',
    'candidates': 127799212.55,
    'parties': 35904262.78,
    'pacs': 263191.92,
    'other': 242687
  },
  {
    'period': 'Jul 1 - Sep 30, 2016',
    'status': 'not-started',
    'candidates': 0,
    'parties': 0,
    'pacs': 0,
  },
  {
    'period': 'Oct 1 - Dec 31, 2016',
    'status': 'not-started',
    'candidates': 0,
    'parties': 0,
    'pacs': 0,
  }
];

function Overview(selector, data) {
  this.$element = $(selector);
  this.data = data;

  this.totals = this.$element.find('.js-total');
  this.reactionBox = this.$element.find('.js-reaction-box');

  new GroupedBarChart(selector + ' .js-chart', this.data);

  helpers.zeroPad('.js-totals', '.js-zero-pad');
}

new Overview('.js-raised-overview', raisingData);
new Overview('.js-spent-overview', spendingData);
$('.js-top-list').each(function() {
  var dataType = $(this).data('type');
  new TopList(this, dataType);
});
