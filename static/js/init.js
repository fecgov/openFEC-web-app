'use strict';

var filters = require('./modules/filters.js');
var typeahead = require('./modules/typeahead.js');
var tablesort = require('tablesort');
var glossary = require('./modules/glossary.js');

filters.init();
typeahead.init();
glossary.init();

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

    // Forcing the .main-container to fit the entire height of the page
    var setMainSize = function() {
        var headerHeight = $('.site-header').height(),
            footerHeight = $('footer').height(),
            pageHeight = $('.page-wrap').height(),
            mainHeight = pageHeight - headerHeight - footerHeight;
            $('.main-container').height(mainHeight);
    }

    setMainSize();

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
