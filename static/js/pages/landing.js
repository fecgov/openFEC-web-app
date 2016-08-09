'use strict';

/* global require, ga */

var $ = require('jquery');

var LineChart = require('../modules/line-chart').LineChart;
var TopList = require('../modules/top-list').TopList;
var ReactionBox = require('../modules/reaction-box').ReactionBox;
var helpers = require('../modules/helpers');
var analytics = require('fec-style/js/analytics');

var raisingData = [
  {
    'month': 'Jan 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Feb 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Mar 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Apr 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'May 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Jun 2015',
    'candidates': 305427675.73,
    'parties': 217813182.16,
    'pacs': 680219721.08,
    'other': 7741.44
  },
  {
    'month': 'Jul 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Aug 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Sep 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Oct 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Nov 2015',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Dec 2015',
    'candidates': 835030863.33,
    'parties': 427419879.42,
    'pacs': 1264486081.05,
    'other': 27254.16
  },
  {
    'month': 'Jan 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Feb 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Mar 2016',
    'candidates': 1267228430.31,
    'parties': 573102346.11,
    'pacs': 1854491330.87,
    'other': 428781.05
  },
  {
    'month': 'Apr 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'May 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Jun 2016',
    'candidates': 1371424715.56,
    'parties': 626416709.5,
    'pacs': 1854850620.14,
    'other': 428781.05
  },
  {
    'month': 'Jul 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Aug 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Sep 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Oct 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Nov 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  },
  {
    'month': 'Dec 2016',
    'candidates': '',
    'parties': '',
    'pacs': '',
    'other': ''
  }
]

function Overview(selector, data, index) {
  this.selector = selector;
  this.$element = $(selector);
  this.data = data;
  this.index = index;

  this.totals = this.$element.find('.js-total');
  this.reactionBox = this.$element.find('.js-reaction-box');

  this.zeroPadTotals();

  $(window).on('resize', this.zeroPadTotals.bind(this));

  new LineChart(selector + ' .js-chart', this.data, this.index);
}

Overview.prototype.zeroPadTotals = function() {
  helpers.zeroPad(this.selector + ' .js-totals', '.overview__total-number', '.figure__decimals');
};

new Overview('.js-raised-overview', raisingData, 1);
// new Overview('.js-spent-overview', spendingData, 2);

$('.js-reaction-box').each(function() {
  new ReactionBox(this);
});

var maxHeight = 0;
var $topLists = $('.js-top-list');

$topLists.each(function() {
  var dataType = $(this).data('type');
  new TopList(this, dataType);

  var thisHeight = $(this).height();
  if (thisHeight > maxHeight) {
    maxHeight = thisHeight;
  }
});

$topLists.each(function() {
  $(this).height(maxHeight);
});

$('.js-ga-event').each(function() {
  var eventName = $(this).data('ga-event');
  $(this).on('click', function() {
    if (analytics.trackerExists()) {
      var gaEventData = {
        eventCategory: 'Misc. events',
        eventAction: eventName,
        eventValue: 1
      };
      ga('nonDAP.send', 'event', gaEventData);
    }
  });
});
