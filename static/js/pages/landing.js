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
    'date': '1/1/2015',
    'candidates': 0,
    'pacs': 0,
    'party': 0
  },
  {
    'date': '2/1/2015',
    'candidates': 67016.47,
    'pacs': 38955102.59,
    'party': 36524891.61
  },
  {
    'date': '3/1/2015',
    'candidates': 599921,
    'pacs': 79181316.45,
    'party': 76374954.03
  },
  {
    'date': '4/1/2015',
    'candidates': 141325569.5,
    'pacs': 142388089.04,
    'party': 139204709.9
  },
  {
    'date': '5/1/2015',
    'candidates': 142956083.33,
    'pacs': 178217174.97,
    'party': 181614636.8
  },
  {
    'date': '6/1/2015',
    'candidates': 143342406.8,
    'pacs': 236040056.13,
    'party': 219702630.8
  },
  {
    'date': '7/1/2015',
    'candidates': 451094822.58,
    'pacs': 717844843.47,
    'party': 275288799.3
  },
  {
    'date': '8/1/2015',
    'candidates': 451096289.15,
    'pacs': 753284533.24,
    'party': 311721337
  },
  {
    'date': '9/1/2015',
    'candidates': 451325606.68,
    'pacs': 785322483.13,
    'party': 347021951.7
  },
  {
    'date': '10/1/2015',
    'candidates': 758125401.53,
    'pacs': 830308849.88,
    'party': 387381412.8
  },
  {
    'date': '11/1/2015',
    'candidates': 758256848.49,
    'pacs': 874518147.3,
    'party': 428504762.4
  },
  {
    'date': '12/1/2015',
    'candidates': 758303367.58,
    'pacs': 911888352.09,
    'party': 474948034.2
  },
  {
    'date': '1/1/2016',
    'candidates': 1108344185.24,
    'pacs': 1387739680.53,
    'party': 535317519.9
  },
  {
    'date': '2/1/2016',
    'candidates': 1173968015.89,
    'pacs': 1490321191.87,
    'party': 587043747.7
  },
  {
    'date': '3/1/2016',
    'candidates': 1306638467.96,
    'pacs': 1659379225.01,
    'party': 645291322.4
  },
  {
    'date': '4/1/2016',
    'candidates': 1617439805.46,
    'pacs': 1935807904.66,
    'party': 722474098.1
  },
  {
    'date': '5/1/2016',
    'candidates': 1729070916.9,
    'pacs': 2080501265.79,
    'party': 785827631.2
  },
  {
    'date': '6/1/2016',
    'candidates': 1811770795.98,
    'pacs': 2198609138.48,
    'party': 860988752
  },
  {
    'date': '7/1/2016',
    'candidates': 2136103644.63,
    'pacs': 2493168873.62,
    'party': 953722512.3
  },
  {
    'date': '8/1/2016',
    'candidates': 2150698783.26,
    'pacs': 2496380499.98,
    'party': 953771714.2
  }
];

function Overview(selector, data, index) {
  this.selector = selector;
  this.$element = $(selector);
  this.data = data;
  this.index = index;

  this.totals = this.$element.find('.js-total');
  this.reactionBox = this.$element.find('.js-reaction-box');

  this.zeroPadTotals();

  $(window).on('resize', this.zeroPadTotals.bind(this));

  new LineChart(selector + ' .js-chart', selector + ' .js-snapshot', this.data, this.index);
}

Overview.prototype.zeroPadTotals = function() {
  helpers.zeroPad(this.selector + ' .js-snapshot', '.overview__total-number', '.figure__decimals');
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
