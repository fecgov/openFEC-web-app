'use strict';
var terms = require('./terms');
var _ = require('underscore');

var glossaryLink = $('.term'),
    glossaryIsOpen = false,
    indexToLowercase,
    findDefinition,
    setDefinition,
    showGlossary,
    hideGlossary,
    clearTerm;

// Indexing the terms and then lowercasing the indices
indexToLowercase = function(arrayOfObjects, index){
    var key, 
        newKey,
        indexedTerms = _.indexBy(arrayOfObjects, index),
        keys = Object.keys(indexedTerms),
        n = keys.length,
        indexedLowercaseTerms = {};
    for ( var i = 0; i < n; i++ ) {
      key = keys[i];
      newKey = keys[i].toLowerCase();
      indexedLowercaseTerms[newKey] = indexedTerms[key];    
    }
    return indexedLowercaseTerms;    
}

terms = indexToLowercase(terms, 'term');

// Adding title to all terms
$('.term').attr('title', 'Click to define');

// Looks through the terms array to find the definition
// Returnes a definedTerm object
findDefinition = function(term){
    var term = term.toLowerCase(),
        definition,
        definedTerm = {};
    if ( terms.hasOwnProperty(term) ) {
        definedTerm.term = terms[term].term;
        definedTerm.definition = terms[term].definition;
    } else {
        definedTerm = null;
    }
    return definedTerm;
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
    $('.term--highlight').removeClass('term--highlight');   
    $('body').removeClass('panel-active--right');
    $('#glossary-toggle').removeClass('active');
    glossaryIsOpen = false;
    clearTerm();
}

// Sets the values in the glossary and highlights the defined terms
// Takes a definedTerm object like {term: 'string', definition: 'string'}
setDefinition = function(definedTerm) {
    var term,
        definition;

    // Set the values of everything
    if ( definedTerm !== null ) {
        term = definedTerm.term;
        definition = definedTerm.definition;
        $('#glossary-term').html(term);  
        $('#glossary-definition').html(definition);
    } 
    else {
        $('#glossary-definition').html('Sorry, there are no definitions for this term. Please try again.');
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
    glossaryLink.click(function(){
        var dataTerm = $(this).data('term'),
            definedTerm = findDefinition(dataTerm);
        showGlossary();
        setDefinition(definedTerm);    
    })

    $('#glossary-toggle').click(function(){
        if (glossaryIsOpen) {
            hideGlossary();
        } else {
            showGlossary();
        }
    });

    $("#glossary-search").keyup(function(event){
        if(event.keyCode == 13){
            var value = $(this).val(),
                definedTerm = findDefinition(value);
            setDefinition(definedTerm);
        }
    });
 },

    setDefinition: setDefinition
}