'use strict';

var filters = require('./modules/filters.js');
var typeahead = require('./modules/typeahead.js');
var charts = require('./modules/charts.js');
var tablesort = require('tablesort');

filters.init();
typeahead.init();
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

    $('.side-toggle').click(function(){
        $('#main').toggleClass('side--open');
    })

    // Sticky page controls
    if ( $pageControls.length > 0 ) {
        var scrollPos,
            controlsHeight,
            $firstSection = $pageControls.next(), // Find the first element after the controls
            firstTop = $firstSection.offset().top;
        $(document).scroll(function(){
          scrollPos = $(window).scrollTop();

          if (scrollPos >= firstTop) {
            controlsHeight = $pageControls.height();
            $body.addClass('controls--fixed');
            // $body.css('padding-top', controlsHeight);
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

    // unload overlay
    // CSS spinner courtesy of http://tobiasahlin.com/spinkit/
    var spinner = '<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>';
    $(window).on("beforeunload", function(e){
       var fullHeight = $(document).height();
       $('body').prepend('<div class="unloading">' + spinner + '</div>'); 
       $('.unloading').height(fullHeight);
    });
});
