'use strict';
var terms = require('./terms');
var _ = require('underscore');

var glossaryLink = $('.term'),
    glossaryIsOpen = false,
    findDefinition,
    setDefinition,
    showGlossary,
    hideGlossary,
    defineTerm,
    clearTerm,
    showDefinition;

// Indexing the terms
terms = _.indexBy(terms, 'term');

// Looks through the terms array to find the definition
findDefinition = function(term){
    var definition;
    if ( terms.hasOwnProperty(term) ) {
        definition = terms[term].definition;
    } else {
        definition = null;
    }
    return definition;
}

// Assigns the correct data-definition to each <span class="term">
setDefinition = function(){
    $('.term').each(function(){
        var term = $(this).data('term'),
            definition;
        definition = findDefinition(term);
        $(this).attr('title', 'Click to define').attr('data-definition', definition);
    })
}

// Opens the glossary
showGlossary = function() {
    $('.side-panel--right').addClass('side-panel--open');
    $('body').addClass('panel-active--right');
    $('#glossary-toggle').addClass('active');
    $('#glossary-search').focus();
    glossaryIsOpen = true;
}

// Hides the glossary
hideGlossary = function() {
    $('.side-panel--right').removeClass('side-panel--open');
    $('body').removeClass('side-panel--right--open');
    $('.term--highlight').removeClass('term--highlight');   
    clearTerm();
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

clearTerm = function() {
    $('#glossary-term').html('');
    $('#glossary-definition').html('');
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

    $("#glossary-search").keyup(function(event){
        if(event.keyCode == 13){
            var value = $(this).val(),
                definition;
            definition = findDefinition(value);
            if ( definition !== null ) {
                defineTerm(value, definition);
            } else {
                $('#glossary-definition').html('Sorry, there are no terms matching your search: "<strong>' + value + '</strong>". Please try again.');
                $('#glossary-term').html('');
            }
        }
    });
 },

    defineTerm: defineTerm
}