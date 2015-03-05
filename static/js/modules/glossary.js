'use strict';
var terms = require('./terms');

var glossaryLink = $('.term'),
    glossaryIsOpen = false,
    setDefinition,
    showGlossary,
    hideGlossary,
    defineTerm,
    showDefinition;

// Assigns the correct data-definition to each <span class="term">
setDefinition = function(){
    $('.term').each(function(){
        var term = $(this).data('term'),
            definition;
        $(this).attr('title', 'Click to define');
        for ( var i = 0; i < terms.length; i++ ) {
            if ( terms[i].term === term ) {
                definition = terms[i].definition;
                $(this).attr('data-definition', definition);
            }
        }
    })
}

// Opens the glossary
showGlossary = function() {
    $('.side-panel--right').addClass('side-panel--open');
    $('body').addClass('panel-active--right');
    $('#glossary-toggle').addClass('active');
    glossaryIsOpen = true;
}

// Hides the glossary
hideGlossary = function() {
    $('.side-panel--right').removeClass('side-panel--open');
    $('body').removeClass('side-panel--right--open');
    $('.term--highlight').removeClass('term--highlight');   
}

// Sets the values in the glossary and highlights the defined terms
defineTerm = function(term, definition) {
    // Set the values of everything
    $('#glossary-search').val(term);
    $('#glossary-term').html(term);
    $('#glossary-definition').html(definition);

    // Highlight the term and remove other highlights
    $('.term--highlight').removeClass('term--highlight');
    $('span[data-term="' + term + '"]').addClass('term--highlight');
}

module.exports = {
  init: function(){
    setDefinition();
    
    glossaryLink.click(function(){
        var term = $(this).data('term'),
            definition = $(this).data('definition');
        showGlossary();
        defineTerm(term, definition);    
    })

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