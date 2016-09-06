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
    'pacs': 131920394.65,
    'party': 108477977.38,
    'other': 0
  },
  {
    'date': '4/30/2015',
    'candidates': 79361028.36,
    'pacs': 165777331.44,
    'party': 143447089.62,
    'other': 0
  },
  {
    'date': '5/31/2015',
    'candidates': 79862379.53,
    'pacs': 219853185.05,
    'party': 175708440.1,
    'other': 0
  },
  {
    'date': '6/30/2015',
    'candidates': 306462961.36,
    'pacs': 680801545.41,
    'party': 217819849.02,
    'other': 7741.44
  },
  {
    'date': '7/31/2015',
    'candidates': 306463089.36,
    'pacs': 713795971.17,
    'party': 247254831.04,
    'other': 7741.44
  },
  {
    'date': '8/31/2015',
    'candidates': 306633171.16,
    'pacs': 743804395.88,
    'party': 274768896.7,
    'other': 7741.44
  },
  {
    'date': '9/30/2015',
    'candidates': 548965433.71,
    'pacs': 786443680.64,
    'party': 306676172.2,
    'other': 18593.72
  },
  {
    'date': '10/31/2015',
    'candidates': 549001907.67,
    'pacs': 829180231.42,
    'party': 339246965.44,
    'other': 18593.72
  },
  {
    'date': '11/30/2015',
    'candidates': 549051959.59,
    'pacs': 864355420.47,
    'party': 380107160.04,
    'other': 18593.72
  },
  {
    'date': '12/31/2015',
    'candidates': 827679915.83,
    'pacs': 1264794073.56,
    'party': 427422807.26,
    'other': 27254.16
  },
  {
    'date': '1/31/2016',
    'candidates': 891326947.55,
    'pacs': 1361210334.2,
    'party': 466859976.04,
    'other': 27254.16
  },
  {
    'date': '2/29/2016',
    'candidates': 1015923567.67,
    'pacs': 1520548644.29,
    'party': 512735100.53,
    'other': 329954.16
  },
  {
    'date': '3/31/2016',
    'candidates': 1257116760.86,
    'pacs': 1768832067.57,
    'party': 573189410.51,
    'other': 438816.05
  },
  {
    'date': '4/30/2016',
    'candidates': 1359032483.79,
    'pacs': 1901109361.9,
    'party': 626462653.22,
    'other': 438816.05
  },
  {
    'date': '5/31/2016',
    'candidates': 1425797902.71,
    'pacs': 1984234275.57,
    'party': 688530137.81,
    'other': 438816.05
  },
  {
    'date': '6/30/2016',
    'candidates': 1654399991.88,
    'pacs': 2235766619.02,
    'party': 763793574.83,
    'other': 497359.54
  },
  {
    'date': '7/31/2016',
    'candidates': 1665946694.7,
    'pacs': 2243677388.98,
    'party': 764080071.51,
    'other': 3252279.54
  }
];

var spendingData = [
  {
    'date': '1/31/2015',
    'candidates': 4523.45,
    'pacs': 4394922.87,
    'party': 22904618.72,
    'other': 0
  },
  {
    'date': '2/28/2015',
    'candidates': 14521.54,
    'pacs': 9588279.13,
    'party': 51439279.4,
    'other': 0
  },
  {
    'date': '3/31/2015',
    'candidates': 40866880.18,
    'pacs': 16963268.67,
    'party': 96683390.24,
    'other': 0
  },
  {
    'date': '4/30/2015',
    'candidates': 42514235.24,
    'pacs': 22064851.87,
    'party': 131245052.68,
    'other': 0
  },
  {
    'date': '5/31/2015',
    'candidates': 43656987.33,
    'pacs': 28172051.57,
    'party': 157712838.59,
    'other': 0
  },
  {
    'date': '6/30/2015',
    'candidates': 147157675.53,
    'pacs': 118483764.3,
    'party': 192007781.85,
    'other': 259698.7
  },
  {
    'date': '7/31/2015',
    'candidates': 147158671.97,
    'pacs': 122854282.18,
    'party': 217638297.02,
    'other': 259698.7
  },
  {
    'date': '8/31/2015',
    'candidates': 147431460.35,
    'pacs': 127557203.85,
    'party': 242490412.37,
    'other': 259698.7
  },
  {
    'date': '9/30/2015',
    'candidates': 315225980.25,
    'pacs': 138118926.5,
    'party': 266525194.23,
    'other': 5472476.94
  },
  {
    'date': '10/31/2015',
    'candidates': 315255697.56,
    'pacs': 145227524.16,
    'party': 293118672.58,
    'other': 5479943.94
  },
  {
    'date': '11/30/2015',
    'candidates': 315285152.05,
    'pacs': 152859227.35,
    'party': 330809753.67,
    'other': 5479943.94
  },
  {
    'date': '12/31/2015',
    'candidates': 557644109.81,
    'pacs': 378270228.75,
    'party': 365215334.98,
    'other': 5826240.51
  },
  {
    'date': '1/31/2016',
    'candidates': 667140235.29,
    'pacs': 463827739.73,
    'party': 393216273.34,
    'other': 5826240.51
  },
  {
    'date': '2/29/2016',
    'candidates': 819324180.56,
    'pacs': 542921854.38,
    'party': 430330290.04,
    'other': 5928818.51
  },
  {
    'date': '3/31/2016',
    'candidates': 1033491393.07,
    'pacs': 641572055.05,
    'party': 467321000.73,
    'other': 29200505.81
  },
  {
    'date': '4/30/2016',
    'candidates': 1157634582.67,
    'pacs': 686039443.05,
    'party': 503239233.52,
    'other': 29718146.81
  },
  {
    'date': '5/31/2016',
    'candidates': 1234295369.43,
    'pacs': 720529569.48,
    'party': 540940243.95,
    'other': 29869167.81
  },
  {
    'date': '6/30/2016',
    'candidates': 1462777577.75,
    'pacs': 877277584,
    'party': 586542069.5,
    'other': 51038735.54
  },
  {
    'date': '7/31/2016',
    'candidates': 1479430004.24,
    'pacs': 878776312.73,
    'party': 586877965.16,
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
