'use strict';
var terms = require('./terms');

var glossaryLink = $('.term'),
    glossaryIsOpen = false;

var setDefinition = function(){
    $('.term').each(function(){
        var term = $(this).data('term'),
            definition;
        for ( var i = 0; i < terms.length; i++ ) {
            if ( terms[i].term === term ) {
                definition = terms[i].definition;
                $(this).attr('data-definition', definition);
            }
        }
    })
}

var showGlossary = function() {
    $('.side-panel--right').addClass('side-panel--open');
    $('body').addClass('panel-active--right');
    $('#glossary-toggle').addClass('active');
    glossaryIsOpen = true;
}

var hideGlossary = function() {
    $('.side-panel--right').removeClass('side-panel--open');
    $('body').removeClass('side-panel--right--open');
    $('.term--highlight').removeClass('term--highlight');   
}

var defineTerm = function(term, definition) {
    // Set the values of everything
    $('#glossary-search').val(term);
    $('#glossary-term').html(term);
    $('#glossary-definition').html(definition);

    // Highlight the term and remove other highlights
    $('.term--highlight').removeClass('term--highlight');
    $('span[data-term="' + term + '"]').addClass('term--highlight');
}


var showDefinition = function() {
    glossaryLink.click(function(){
        var term = $(this).data('term'),
            definition = $(this).data('definition');
        showGlossary();
        defineTerm(term, definition);    
    })
}




module.exports = {
  init: function(){
    setDefinition();
    showDefinition();

    $('#glossary-toggle').click(function(){
        if (glossaryIsOpen) {
            hideGlossary();
            $('body').removeClass('panel-active--right');
            $(this).removeClass('active');
            glossaryIsOpen = false;
        } else {
            showGlossary();
        }
    });
 },
 defineTerm: defineTerm
}