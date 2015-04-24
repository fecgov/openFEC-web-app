'use strict';

var filters = require('./modules/filters.js');
var typeahead = require('./modules/typeahead.js');
var charts = require('./modules/charts.js');
var tablesort = require('tablesort');
var glossary = require('./modules/glossary.js');

filters.init();
typeahead.init();
glossary.init();
charts.init();

$(document).ready(function() {
    var $body,
        $pageControls;
    $body = $('body');
    $pageControls = $('.page-controls');
    $body.addClass('js-initialized');

    $('.table--sortable').each(function(){
        new tablesort(this);
    });

    $('#filter-toggle').click(function(){
    	$('body').toggleClass('panel-active--left');
        $('.side-panel--left').toggleClass('side-panel--open');
        $(this).toggleClass('active');
    })

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
        })
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
        })
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
    })

    // Notice close-state persistence    
    if (typeof window.sessionStorage !== 'undefined') {
        if (window.sessionStorage.getItem('keep-banner-closed') === '1') {
            $('#notice').attr('aria-hidden', true);
        } else {
            $('#notice').attr('aria-hidden', false);
        }
    }

    $("#notice-close").on('click keypress', function(e){
        if (e.which === 13 || e.type === 'click') {
            if (typeof window.sessionStorage !== 'undefined') {
                window.sessionStorage.setItem('keep-banner-closed', '1');
            }            
        }
    });

    // unload overlay
    // CSS spinner courtesy of http://tobiasahlin.com/spinkit/
    var spinner = '<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>';
    $(window).on("beforeunload", function(e){
       var fullHeight = $(document).height();
       $('body').prepend('<div class="unloading">' + spinner + '</div>'); 
       $('.unloading').height(fullHeight);
    });
});
