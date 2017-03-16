'use strict';

/* global context, ga */

var $ = require('jquery');
var analytics = require('fec-style/js/analytics');
var ReactionBox = require('../modules/reaction-box').ReactionBox;
var TopEntities = require('../modules/top-entities').TopEntities;
var BreakdownMap = require('../modules/breakdown-map').BreakdownMap;

new TopEntities('.js-top-entities', context.type);
new BreakdownMap('.js-breakdown-map', context.type);

$('.js-reaction-box').each(function() {
  new ReactionBox(this);
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
