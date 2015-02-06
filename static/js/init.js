'use strict';

var filters = require('./modules/filters.js');
var typeahead = require('./modules/typeahead.js');
var tablesort = require('tablesort');

filters.init();
typeahead.init();

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
    	$('.results-content').toggleClass('filters--open');
    })

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

});
