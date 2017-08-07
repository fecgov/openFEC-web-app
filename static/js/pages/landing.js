'use strict';

/* global require, ga */

var $ = require('jquery');
var lookup = require('../modules/election-lookup');

var LineChart = require('../modules/line-chart').LineChart;
var TopList = require('../modules/top-list').TopList;
var helpers = require('../modules/helpers');
var analytics = require('fec-style/js/analytics');

function Overview(selector, type, index) {
  this.selector = selector;
  this.$element = $(selector);
  this.type = type;
  this.index = index;

  this.totals = this.$element.find('.js-total');

  this.zeroPadTotals();

  $(window).on('resize', this.zeroPadTotals.bind(this));

  new LineChart(selector + ' .js-chart', selector + ' .js-snapshot', this.type, this.index);
}

Overview.prototype.zeroPadTotals = function() {
  helpers.zeroPad(this.selector + ' .js-snapshot', '.snapshot__item-number', '.figure__decimals');
};

new Overview('.js-raised-overview', 'raised', 1);
new Overview('.js-spent-overview', 'spent', 2);

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

$(document).ready(function() {
  new lookup.ElectionLookup('#election-lookup', false);
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
