'use strict';

/* global require, window, document */

var KEYCODE_SLASH = 191;

var $ = require('jquery');
var _ = require('underscore');
var keyboard = require('keyboardjs');

// Hack: Append jQuery to `window` for use by legacy libraries
window.$ = window.jQuery = $;

var terms = require('fec-style/js/terms');
var glossary = require('fec-style/js/glossary');
var accordion = require('fec-style/js/accordion');
var dropdown = require('fec-style/js/dropdowns');
var siteNav = require('fec-style/js/site-nav');
var typeahead = require('fec-style/js/typeahead');
var typeaheadFilter = require('fec-style/js/typeahead-filter');

require('jquery.inputmask');
require('jquery.inputmask/dist/inputmask/jquery.inputmask.date.extensions.js');
require('jquery.inputmask/dist/inputmask/jquery.inputmask.numeric.extensions.js');

// Include vendor scripts
require('./vendor/tablist');

var filters = require('./modules/filters.js');
var charts = require('./modules/charts.js');
var Search = require('./modules/search');
var toggle = require('./modules/toggle');

charts.init();

var SLT_ACCORDION = '.js-accordion';

$('.js-dropdown').each(function() {
  new dropdown.Dropdown(this);
});

$('.js-site-nav').each(function() {
  new siteNav.SiteNav(this);
});

$('.js-typeahead-filter').each(function() {
  var key = $(this).data('dataset');
  var dataset = typeahead.datasets[key];
  new typeaheadFilter.TypeaheadFilter(this, dataset);
});

$(document).ready(function() {
    var $body,
        $pageControls;
    $body = $('body');
    $pageControls = $('.page-controls');
    $body.addClass('js-initialized');

    // Sticky page controls
    if ( $pageControls.length > 0 ) {
        var scrollPos,
            controlsHeight,
            controlsTop = $pageControls.offset().top + 100;
        $(document).scroll(function(){
          scrollPos = $(window).scrollTop();

          if (scrollPos >= controlsTop) {
            controlsHeight = $pageControls.height();
            $pageControls.addClass('is-fixed');
            $body.css('padding-top', controlsHeight);
          } else {
            $pageControls.removeClass('is-fixed');
            $body.css('padding-top', 0);
          }
        });
    }

    // Initialize glossary
    new glossary.Glossary(terms, {body: '#glossary'});

    // Initialize typeaheads
    new typeahead.Typeahead('.js-search-input', $('.js-search-type').val());

    // Focus search on "/"
    $(document.body).on('keyup', function(e) {
      if (e.keyCode === KEYCODE_SLASH) {
        $('.js-search-input:visible').first().focus();
      }
    });

    // Inialize input masks
    $('[data-inputmask]').inputmask();

    // Reveal containers
    if ( $('.js-reveal-container').length > 0 ) {
        var $revealButton = $('.js-reveal-button');
        $revealButton.click(function(){
            var $revealContainer = $(this).parents('.js-reveal-container'),
                $revealContent = $revealContainer.find('.js-reveal-content');
            if ( $revealContent.hasClass('u-hidden') ) {
                $revealContent.removeClass('u-hidden').attr('aria-hidden', 'false');
                $(this).html('Hide charts');
            } else {
                $revealContent.addClass('u-hidden').attr('aria-hidden', 'true');
                $(this).html('View charts');
            }
        });
    }

    // General reveal / disclosure
    $('.js-reveal').on('click keypress', function(e){
        if (e.which === 13 || e.type === 'click') {
            var revealElement = $(this).data('reveals');
            $('#' + revealElement).attr('aria-hidden', false);
            $(this).addClass('selected');
        }
    });

    $('.js-hide').on('click keypress', function(e){
        if (e.which === 13 || e.type === 'click') {
            var hideElement = $(this).data('hides');
            $('#' + hideElement).attr('aria-hidden', true);
            // Set focus back on the original triggering element
            $('.js-reveal[data-reveals="' + hideElement + '"]').removeClass('selected');
        }
    });

    $(document.body).on('keyup', function(e) {
        if (e.keyCode == keyboard.key.code('escape')) {
            var menu = $('#site-menu');
            if (menu.attr('aria-hidden') === 'false') {
                menu.attr('aria-hidden', true);
                $('.js-reveal[data-reveals="site-menu"]').focus();
            }
        }
    });

    // Notice close-state persistence
    // Commenting out for now
    // if (typeof window.sessionStorage !== 'undefined') {
    //     if (window.sessionStorage.getItem('keep-banner-closed') === '1') {
    //         $('#notice').attr('aria-hidden', true);
    //         $('#notice-reveal').addClass('u-visible');
    //     } else {
    //         $('#notice').attr('aria-hidden', false);
    //     }
    // }

    $("#notice-close").on('click keypress', function(e){
        if (e.which === 13 || e.type === 'click') {
            $('#notice-reveal').addClass('u-visible');
            if (typeof window.sessionStorage !== 'undefined') {
                window.sessionStorage.setItem('keep-banner-closed', '1');
            }
        }
    });

    // Hide the notice reveal link if you open it
    $('#notice-reveal').click(function(){
      $(this).removeClass('u-visible');
    });

    // Initialize accordions
    $(SLT_ACCORDION).each(function() {
      Object.create(accordion).init($(this));
    });

    var $search = $('.js-search');
    $search.each(function() {
      new Search($(this));
    });

    // @if DEBUG
    var perf = require('./modules/performance');
    perf.bar();
    // @endif

    filters.init();
    toggle.init();
});
