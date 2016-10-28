'use strict';

/* global context, ga */

var $ = require('jquery');
var analytics = require('fec-style/js/analytics');
var ReactionBox = require('../modules/reaction-box').ReactionBox;
var TopEntities = require('../modules/top-entities').TopEntities;
var maps = require('../modules/maps');
var events = require('fec-style/js/events');

new TopEntities('.js-top-entities', context.type);

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

// Set up state map
var stateData = {
  "results": [
    {
      "state": "AR",
      "total": 1000,
    },
    {
      "state": "MI",
      "total": 2000,
    },
    {
      "state": "OH",
      "total": 4000,
    },
    {
      "state": "AK",
      "total": 5000,
    },
     {
      "state": "IN",
      "total": 6000,
    },
  ]
};
var opts = {
  width: 350,
  height: 300,
  scale: 400,
  translate: [160, 120],
  min: null,
  max: null,
  addLegend: true,
  addTooltips: true,
};
var $map = $('.state-map');
maps.stateMap($map, stateData, opts);

// var url = buildStateUrl($map);

// $.getJSON(url).done(function(data) {
//   maps.stateMap($map, data, 400, 300, null, null, true, true);
// });

// events.on('state.table', function(params) {
//   highlightRowAndState($map, $('.data-table'), params.state, false);
// });

$map.on('click', 'path[data-state]', function() {
  var state = $(this).attr('data-state');
  events.emit('state.map', {state: state});
});
