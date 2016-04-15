'use strict';

/* global window, document, Inputmask, BASE_PATH, CMS_URL */

var $ = require('jquery');
var Sticky = require('component-sticky');
var Accordion = require('aria-accordion').Accordion;
var Glossary = require('glossary-panel');

// Hack: Append jQuery to `window` for use by legacy libraries
window.$ = window.jQuery = $;

var terms = require('fec-style/js/terms');
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
require('./vendor/tablist').init();

var charts = require('./modules/charts');
var Search = require('./modules/search');
var toggle = require('./modules/toggle');
var helpers = require('./modules/helpers');
var download = require('./modules/download');
var CycleSelect = require('./modules/cycle-select').CycleSelect;

$(document).ready(function() {
  charts.init();

  $('.js-dropdown').each(function() {
    new dropdown.Dropdown(this);
  });

  $('.js-site-nav').each(function() {
    new siteNav.SiteNav(this, {
      cmsUrl: CMS_URL,
      webAppUrl: BASE_PATH
    });
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
  new Glossary(terms, {}, {
    termClass: 'glossary__term accordion__button',
    definitionClass: 'glossary__definition accordion__content'
  });

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

  // Initialize new accordions
  $('.js-accordion').each(function(){
    var contentPrefix = $(this).data('content-prefix') || 'accordion';
    var openFirst = $(this).data('open-first');
    var selectors = {
      body: '.js-accordion',
      trigger: '.js-accordion-trigger'
    };
    var opts = {
      contentPrefix: contentPrefix,
      openFirst: openFirst
    };
    new Accordion(selectors, opts);
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
