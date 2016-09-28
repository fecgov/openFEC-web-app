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
    'party': 57135469.9,
    'other': 0
  },
  {
    'date': '3/31/2015',
    'candidates': 77471251.47,
    'pacs': 131920394.65,
    'party': 108478260.8,
    'other': 0
  },
  {
    'date': '4/30/2015',
    'candidates': 79254923.83,
    'pacs': 165777331.44,
    'party': 143447373.04,
    'other': 0
  },
  {
    'date': '5/31/2015',
    'candidates': 79756275,
    'pacs': 219853185.05,
    'party': 175708723.52,
    'other': 0
  },
  {
    'date': '6/30/2015',
    'candidates': 306281796.83,
    'pacs': 680699507.41,
    'party': 217820132.44,
    'other': 7741.44
  },
  {
    'date': '7/31/2015',
    'candidates': 306281934.83,
    'pacs': 713693933.17,
    'party': 247255114.46,
    'other': 7741.44
  },
  {
    'date': '8/31/2015',
    'candidates': 306452016.63,
    'pacs': 743702357.88,
    'party': 274769180.12,
    'other': 7741.44
  },
  {
    'date': '9/30/2015',
    'candidates': 547949082.18,
    'pacs': 787100447.64,
    'party': 306676455.62,
    'other': 18593.72
  },
  {
    'date': '10/31/2015',
    'candidates': 547985611.14,
    'pacs': 829836998.42,
    'party': 339247248.86,
    'other': 18593.72
  },
  {
    'date': '11/30/2015',
    'candidates': 548035663.06,
    'pacs': 865012187.47,
    'party': 380107443.46,
    'other': 18593.72
  },
  {
    'date': '12/31/2015',
    'candidates': 826270029.99,
    'pacs': 1266094336.89,
    'party': 427423055.68,
    'other': 27254.16
  },
  {
    'date': '1/31/2016',
    'candidates': 889916727.71,
    'pacs': 1362510597.53,
    'party': 466875794.46,
    'other': 27254.16
  },
  {
    'date': '2/29/2016',
    'candidates': 1014513347.83,
    'pacs': 1521849207.62,
    'party': 512752193.95,
    'other': 329954.16
  },
  {
    'date': '3/31/2016',
    'candidates': 1255190531.27,
    'pacs': 1770658383.78,
    'party': 573280493.93,
    'other': 438816.05
  },
  {
    'date': '4/30/2016',
    'candidates': 1357106254.2,
    'pacs': 1902939937.38,
    'party': 626533176.64,
    'other': 438816.05
  },
  {
    'date': '5/31/2016',
    'candidates': 1423653380.02,
    'pacs': 1986069098.4,
    'party': 688615850.11,
    'other': 438816.05
  },
  {
    'date': '6/30/2016',
    'candidates': 1653502082.93,
    'pacs': 2238044532.19,
    'party': 763919938.29,
    'other': 551787.99
  },
  {
    'date': '7/31/2016',
    'candidates': 1753134740.88,
    'pacs': 2351682858.81,
    'party': 871732170.06,
    'other': 3306707.99
  },
  {
    'date': '8/31/2016',
    'candidates': 1883399322.78,
    'pacs': 2525845906.85,
    'party': 997221077.99,
    'other': 3307935
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
    'candidates': 40627021.18,
    'pacs': 16963283.67,
    'party': 96683390.24,
    'other': 0
  },
  {
    'date': '4/30/2015',
    'candidates': 42274671.24,
    'pacs': 22064866.87,
    'party': 131245052.68,
    'other': 0
  },
  {
    'date': '5/31/2015',
    'candidates': 43417423.33,
    'pacs': 28172066.57,
    'party': 157712838.59,
    'other': 0
  },
  {
    'date': '6/30/2015',
    'candidates': 146850413.53,
    'pacs': 118483804.3,
    'party': 192007781.85,
    'other': 259698.7
  },
  {
    'date': '7/31/2015',
    'candidates': 146851473.97,
    'pacs': 122854322.18,
    'party': 217638297.02,
    'other': 259698.7
  },
  {
    'date': '8/31/2015',
    'candidates': 147124262.35,
    'pacs': 127557243.85,
    'party': 242490412.37,
    'other': 259698.7
  },
  {
    'date': '9/30/2015',
    'candidates': 314744654.56,
    'pacs': 138193996.5,
    'party': 266525194.23,
    'other': 5472476.94
  },
  {
    'date': '10/31/2015',
    'candidates': 314774418.87,
    'pacs': 145302594.16,
    'party': 293118672.58,
    'other': 5479943.94
  },
  {
    'date': '11/30/2015',
    'candidates': 314803873.36,
    'pacs': 152934297.35,
    'party': 330809753.67,
    'other': 5479943.94
  },
  {
    'date': '12/31/2015',
    'candidates': 556186558.75,
    'pacs': 378497477.78,
    'party': 365215334.98,
    'other': 5826240.51
  },
  {
    'date': '1/31/2016',
    'candidates': 665682379.23,
    'pacs': 464054988.76,
    'party': 393226722.27,
    'other': 5826240.51
  },
  {
    'date': '2/29/2016',
    'candidates': 817866324.5,
    'pacs': 543149103.41,
    'party': 430339545.43,
    'other': 5928818.51
  },
  {
    'date': '3/31/2016',
    'candidates': 1031711259.38,
    'pacs': 642094482.12,
    'party': 467329102.38,
    'other': 29276716.81
  },
  {
    'date': '4/30/2016',
    'candidates': 1155854448.98,
    'pacs': 686534537.84,
    'party': 503221013.18,
    'other': 29794357.81
  },
  {
    'date': '5/31/2016',
    'candidates': 1232409045.19,
    'pacs': 721016082.94,
    'party': 540943762.78,
    'other': 29903378.81
  },
  {
    'date': '6/30/2016',
    'candidates': 1461659280.9,
    'pacs': 878327171.01,
    'party': 586613869.92,
    'other': 51593515.84
  },
  {
    'date': '7/31/2016',
    'candidates': 1539874244.13,
    'pacs': 928715997.77,
    'party': 649361275.53,
    'other': 52852523.84
  },
  {
    'date': '8/31/2016',
    'candidates': 1669086332.88,
    'pacs': 1014344445.93,
    'party': 734898386.06,
    'other': 152958212.84
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
