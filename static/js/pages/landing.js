'use strict';

/* global require, ga */

var $ = require('jquery');
var _ = require('underscore');

var LineChart = require('../modules/line-chart').LineChart;
var TopList = require('../modules/top-list').TopList;
var ReactionBox = require('../modules/reaction-box').ReactionBox;
var helpers = require('../modules/helpers');
var analytics = require('fec-style/js/analytics');

var entityTotalsURL = helpers.buildUrl(
  ['totals', 'by_entity'],
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

$.getJSON(entityTotalsURL).done(function(data) {
  var spent = [];
  var raised = [];
  var sortedRaised;
  var sortedSpent;

  _.each(data.results, function(object) {
    var raisedDatum = {
      'date': object.date,
      'candidate': object.cumulative_candidate_receipts,
      'pac': object.cumulative_pac_receipts,
      'party': object.cumulative_party_receipts
    };
    var spentDatum = {
      'date': object.date,
      'candidate': object.cumulative_candidate_disbursements,
      'pac': object.cumulative_pac_disbursements,
      'party': object.cumulative_party_disbursements
    };

    raised.push(raisedDatum);
    spent.push(spentDatum);
  });

  sortedRaised = _.sortBy(raised, 'date');
  sortedSpent = _.sortBy(spent, 'date');
  new Overview('.js-raised-overview', sortedRaised, 1);
  new Overview('.js-spent-overview', sortedSpent, 2);
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
