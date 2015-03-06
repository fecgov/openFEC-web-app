'use strict';
var terms = require('./terms');
var _ = require('underscore');

var glossaryLink = $('.term'),
    glossaryIsOpen = false,
    findDefinition,
    setDefinition,
    showGlossary,
    hideGlossary,
    clearTerm;

// Indexing the terms
terms = _.indexBy(terms, 'term');

// Adding title to all terms
$('.term').attr('title', 'Click to define');

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
setDefinition = function(term, definition) {
    // Set the values of everything
    if ( definition !== null ) {
        $('#glossary-term').html(term);  
        $('#glossary-definition').html(definition);
    } 
    else {
        $('#glossary-definition').html('Sorry, there are no definitions for the term: "<strong>' + term + '</strong>". Please try again.');
        $('#glossary-term').html('');
    }

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
            definition = findDefinition(term);
        showGlossary();
        setDefinition(term, definition);    
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
            setDefinition(value, definition);
        }
    });
 },

    setDefinition: setDefinition
}