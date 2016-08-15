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
    'date': '1/31/2015',
    'candidates': -12682.75,
    'pacs': 37003916.07,
    'party': 25788128.68,
    'other': 0
  },
  {
    'date': '2/28/2015',
    'candidates': -8489.5,
    'pacs': 74983338.56,
    'party': 57135186.48,
    'other': 0
  },
  {
    'date': '3/31/2015',
    'candidates': 77577366,
    'pacs': 131920394.7,
    'party': 108477977.4,
    'other': 0
  },
  {
    'date': '4/30/2015',
    'candidates': 79361028.36,
    'pacs': 165777331.4,
    'party': 143447089.6,
    'other': 0
  },
  {
    'date': '5/31/2015',
    'candidates': 79862379.53,
    'pacs': 219853185.1,
    'party': 175708440.1,
    'other': 0
  },
  {
    'date': '6/30/2015',
    'candidates': 306462961.4,
    'pacs': 680801545.4,
    'party': 217819849,
    'other': 7741.44
  },
  {
    'date': '7/31/2015',
    'candidates': 306463089.4,
    'pacs': 713795971.2,
    'party': 247254831,
    'other': 7741.44
  },
  {
    'date': '8/31/2015',
    'candidates': 306633171.2,
    'pacs': 743804395.9,
    'party': 274768896.7,
    'other': 7741.44
  },
  {
    'date': '9/30/2015',
    'candidates': 548965433.7,
    'pacs': 786443680.6,
    'party': 306676172.2,
    'other': 18593.72
  },
  {
    'date': '10/31/2015',
    'candidates': 549001907.7,
    'pacs': 829180231.4,
    'party': 339246965.4,
    'other': 18593.72
  },
  {
    'date': '11/30/2015',
    'candidates': 549051959.6,
    'pacs': 864355420.5,
    'party': 380107160,
    'other': 18593.72
  },
  {
    'date': '12/31/2015',
    'candidates': 827679915.8,
    'pacs': 1264794074,
    'party': 427422807.3,
    'other': 27254.16
  },
  {
    'date': '1/31/2016',
    'candidates': 891326947.6,
    'pacs': 1361210334,
    'party': 466859976,
    'other': 27254.16
  },
  {
    'date': '2/29/2016',
    'candidates': 1015923568,
    'pacs': 1520548644,
    'party': 512735100.5,
    'other': 329954.16
  },
  {
    'date': '3/31/2016',
    'candidates': 1257116761,
    'pacs': 1768832068,
    'party': 573189410.5,
    'other': 438816.05
  },
  {
    'date': '4/30/2016',
    'candidates': 1359032484,
    'pacs': 1901109362,
    'party': 626462653.2,
    'other': 438816.05
  },
  {
    'date': '5/31/2016',
    'candidates': 1425797903,
    'pacs': 1984234276,
    'party': 688530137.8,
    'other': 438816.05
  },
  {
    'date': '6/30/2016',
    'candidates': 1654399992,
    'pacs': 2235766619,
    'party': 763793574.8,
    'other': 497359.54
  },
  {
    'date': '7/31/2016',
    'candidates': 1665946695,
    'pacs': 2243677389,
    'party': 764080071.5,
    'other': 3252279.54
  }
];

var spendingData = [
  {
    'date': '1/31/2015',
    'candidates': 4523.45,
    'pacs': 4394922.87,
    'party': 42035,
    'other': 0
  },
  {
    'date': '2/28/2015',
    'candidates': 14521.54,
    'pacs': 9588279.13,
    'party': 84098,
    'other': 0
  },
  {
    'date': '3/31/2015',
    'candidates': 40866880.18,
    'pacs': 16963268.67,
    'party': 126192,
    'other': 0
  },
  {
    'date': '4/30/2015',
    'candidates': 42514235.24,
    'pacs': 22064851.87,
    'party': 168316,
    'other': 0
  },
  {
    'date': '5/31/2015',
    'candidates': 43656987.33,
    'pacs': 28172051.57,
    'party': 210471,
    'other': 0
  },
  {
    'date': '6/30/2015',
    'candidates': 147157675.5,
    'pacs': 118483764.3,
    'party': 252656,
    'other': 259698.7
  },
  {
    'date': '7/31/2015',
    'candidates': 147158672,
    'pacs': 122854282.2,
    'party': 294872,
    'other': 259698.7
  },
  {
    'date': '8/31/2015',
    'candidates': 147431460.4,
    'pacs': 127557203.9,
    'party': 337119,
    'other': 259698.7
  },
  {
    'date': '9/30/2015',
    'candidates': 315225980.3,
    'pacs': 138118926.5,
    'party': 379396,
    'other': 5472476.94
  },
  {
    'date': '10/31/2015',
    'candidates': 315255697.6,
    'pacs': 145227524.2,
    'party': 421704,
    'other': 5479943.94
  },
  {
    'date': '11/30/2015',
    'candidates': 315285152.1,
    'pacs': 152859227.4,
    'party': 464042,
    'other': 5479943.94
  },
  {
    'date': '12/31/2015',
    'candidates': 557644109.8,
    'pacs': 378270228.8,
    'party': 506411,
    'other': 5826240.51
  },
  {
    'date': '1/31/2016',
    'candidates': 667140235.3,
    'pacs': 463827739.7,
    'party': 548811,
    'other': 5826240.51
  },
  {
    'date': '2/29/2016',
    'candidates': 819324180.6,
    'pacs': 542921854.4,
    'party': 591240,
    'other': 5928818.51
  },
  {
    'date': '3/31/2016',
    'candidates': 1033491393,
    'pacs': 641572055.1,
    'party': 633700,
    'other': 29200505.81
  },
  {
    'date': '4/30/2016',
    'candidates': 1157634583,
    'pacs': 686039443.1,
    'party': 676190,
    'other': 29718146.81
  },
  {
    'date': '5/31/2016',
    'candidates': 1234295369,
    'pacs': 720529569.5,
    'party': 718711,
    'other': 29869167.81
  },
  {
    'date': '6/30/2016',
    'candidates': 1462777578,
    'pacs': 877277584,
    'party': 761262,
    'other': 51038735.54
  },
  {
    'date': '7/31/2016',
    'candidates': 1479430004,
    'pacs': 878776312.7,
    'party': 803844,
    'other': 52297743.54
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
  helpers.zeroPad(this.selector + ' .js-snapshot', '.snapshot__item-number', '.figure__decimals');
};

new Overview('.js-raised-overview', raisingData, 1);
new Overview('.js-spent-overview', spendingData, 2);

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
