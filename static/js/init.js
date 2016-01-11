'use strict';

/* global window, document, Inputmask, BASE_PATH */

var $ = require('jquery');
var Sticky = require('component-sticky');

// Hack: Append jQuery to `window` for use by legacy libraries
window.$ = window.jQuery = $;

var terms = require('fec-style/js/terms');
var glossary = require('fec-style/js/glossary');
var accordion = require('fec-style/js/accordion');
var dropdown = require('fec-style/js/dropdowns');
var siteNav = require('fec-style/js/site-nav');
var skipNav = require('fec-style/js/skip-nav');
var feedback = require('fec-style/js/feedback');
var typeahead = require('fec-style/js/typeahead');
var analytics = require('fec-style/js/analytics');

require('jquery.inputmask');
require('jquery.inputmask/dist/inputmask/inputmask.date.extensions.js');
require('jquery.inputmask/dist/inputmask/inputmask.numeric.extensions.js');

// @if SENTRY_PUBLIC_DSN
require('raven-js').config('/* @echo SENTRY_PUBLIC_DSN */').install();
// @endif

// Remove extra padding in currency mask
Inputmask.extendAliases({
  currency: {
    prefix: '$',
    groupSeparator: ',',
    alias: 'numeric',
    placeholder: '0',
    autoGroup: true,
    digits: 2,
    digitsOptional: true,
    clearMaskOnLostFocus: false
  }
});

// Include vendor scripts
require('./vendor/tablist');

var charts = require('./modules/charts');
var Search = require('./modules/search');
var toggle = require('./modules/toggle');
var helpers = require('./modules/helpers');
var download = require('./modules/download');
var analytics = require('./modules/analytics');
var CycleSelect = require('./modules/cycle-select').CycleSelect;

$(document).ready(function() {
  charts.init();

  $('.js-dropdown').each(function() {
    new dropdown.Dropdown(this);
  });

  $('.js-site-nav').each(function() {
    new siteNav.SiteNav(this);
  });

  new skipNav.Skipnav('.skip-nav', 'main');

  // Initialize sticky elements
  $('.js-sticky').each(function() {
    var container = $(this).data('sticky-container');
    var opts = {
      within: document.getElementById(container)
    };
    new Sticky(this, opts);
  });

  // Initialize glossary
  new glossary.Glossary(terms, {body: '#glossary'});

  // Initialize typeaheads
  new typeahead.Typeahead(
    '.js-search-input',
    $('.js-search-type').val(),
    BASE_PATH
  );

  // Initialize feedback
  new feedback.Feedback(helpers.buildAppUrl(['issue']));

  // Inialize input masks
  $('[data-inputmask]').inputmask();

  // Initialize accordions
  $('.js-accordion').each(function() {
    Object.create(accordion).init($(this));
  });

  // Initialize search
  $('.js-search').each(function() {
    new Search($(this));
  });

  // TODO: Restore
  // @if DEBUG
  // var perf = require('./modules/performance');
  // perf.bar();
  // @endif

  // @if ANALYTICS
  analytics.init();
  analytics.pageView();
  // @endif

  // Initialize cycle selects
  $('.js-cycle').each(function(idx, elm) {
    CycleSelect.build($(elm));
  });

  toggle.init();
  download.hydrate();
});
