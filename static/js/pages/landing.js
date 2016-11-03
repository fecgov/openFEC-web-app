'use strict';

/* global require, ga */

var $ = require('jquery');
var _ = require('underscore');

var LineChart = require('../modules/line-chart').LineChart;
var TopList = require('../modules/top-list').TopList;
var ReactionBox = require('../modules/reaction-box').ReactionBox;
var helpers = require('../modules/helpers');
var analytics = require('fec-style/js/analytics');

var raisingUrl = helpers.buildUrl(
  ['totals', 'entity-receipts'],
  { 'cycle': '2016', 'per_page': '100'}
);

var spendingUrl = helpers.buildUrl(
  ['totals', 'entity-disbursements'],
  { 'cycle': '2016', 'per_page': '100'}
);

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

$.getJSON(raisingUrl).done(function(data) {
  var raisingData = [];

  _.each(_.groupBy(data.results, 'date'), function(dateGroup) {
    _.each(dateGroup, function(object) {
      object[object.type] = object.receipts;
      delete object.cycle;
      delete object.receipts;
      delete object.type;
    });
    raisingData.push(_.extend.apply(null, dateGroup));
  });

  new Overview('.js-raised-overview', raisingData, 1);
});

$.getJSON(spendingUrl).done(function(data) {
  var spendingData = [];

  _.each(_.groupBy(data.results, 'date'), function(dateGroup) {
    _.each(dateGroup, function(object) {
      object[object.type] = object.disbursements;
      delete object.cycle;
      delete object.disbursements;
      delete object.type;
    });
    spendingData.push(_.extend.apply(null, dateGroup));
  });

  new Overview('.js-spent-overview', spendingData, 2);
});

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
