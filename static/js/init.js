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

    // Expand button
    if ( $('.js-reveal').length > 0 ) {
    	var isHidden = true;
    	$('.js-reveal').click(function(){
    		if ( isHidden === true ) {
    			$('.hidden-container').removeClass('u-hidden');
    			$(this).html('Hide charts');
    			isHidden = false;
    		} else {
				$('.hidden-container').addClass('u-hidden');
    			$(this).html('View charts');
    			isHidden = true;
    		}
    	})
    }


});
