'use strict';

/* global require, window, document */

var $ = require('jquery');
var _ = require('underscore');
var keyboard = require('keyboardjs');
var perfectScrollbar = require('perfect-scrollbar/jquery') ($);

// Hack: Append jQuery to `window` for use by legacy libraries
window.$ = window.jQuery = $;

// Include vendor scripts
require('./vendor/tablist');

var accordion = require('./modules/accordion');
var filters = require('./modules/filters.js');
var typeahead = require('./modules/typeahead.js');
var charts = require('./modules/charts.js');
var glossary = require('./modules/glossary.js');
var Search = require('./modules/search');
var tables = require('./modules/tables');
var maps = require('./modules/maps');

filters.init();
typeahead.init();
glossary.init();
charts.init();
tables.init();
maps.init();

var SLT_ACCORDION = '.js-accordion';

$(document).ready(function() {
    var $body,
        $pageControls;
    $body = $('body');
    $pageControls = $('.page-controls.sticky');
    $body.addClass('js-initialized');

    // Sticky page controls
    if ( $pageControls.length > 0 ) {
        var scrollPos,
            controlsHeight,
            controlsTop = $pageControls.offset().top;
        $(document).scroll(function(){
          scrollPos = $(window).scrollTop();

          if (scrollPos >= controlsTop) {
            controlsHeight = $pageControls.height();
            $body.addClass('controls--fixed');
            $body.css('padding-top', controlsHeight);
          } else {
            $body.removeClass('controls--fixed');
            $body.css('padding-top', 0);
          }
        });
    }

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
            // Set focus to the first input
            $('#' + revealElement + ' input:first-of-type').focus();
        }
    });

    $('.js-hide').on('click keypress', function(e){
        if (e.which === 13 || e.type === 'click') {
            var hideElement = $(this).data('hides');
            $('#' + hideElement).attr('aria-hidden', true);
            // Set focus back on the original triggering element
            $('.js-reveal[data-reveals="' + hideElement + '"]').focus();
        }
    });

    function hideToggles() {
        _.each($('[data-toggles]'), function(toggle) {
            var $toggle = $(toggle);
            $('#' + $toggle.data('toggles')).attr('aria-hidden', 'true');
            $toggle.removeClass('active');
        });
    }

    $('.js-toggle').on('click keypress', function(e) {
        if (e.which === 13 || e.type === 'click') {
            var $this = $(this);
            var $toggleElement = $('#' + $this.data('toggles'));
            if ($toggleElement.attr('aria-hidden') === 'true') {
                hideToggles();
                $toggleElement
                    .attr('aria-hidden', false)
                    .find('li:first-child input').focus();
                $this.addClass('active');

            } else {
                $toggleElement.attr('aria-hidden', true);
                $this.removeClass('active').focus();
            }
        }
        e.preventDefault();
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
    if (typeof window.sessionStorage !== 'undefined') {
        if (window.sessionStorage.getItem('keep-banner-closed') === '1') {
            $('#notice').attr('aria-hidden', true);
            $('#notice-reveal').addClass('u-visible');
        } else {
            $('#notice').attr('aria-hidden', false);
        }
    }

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
      Search($(this));
    });

    // @if DEBUG
    var perf = require('./modules/performance');
    perf.bar();
    // @endif
});
