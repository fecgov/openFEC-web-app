'use strict';

/* global require, module, document */

var $ = require('jquery');
var _ = require('underscore');
var keyboard = require('keyboardjs');
var List = require('list.js');

var terms = require('./terms');

var terms = require('./terms');

var glossaryLink = $('.term'),
    glossaryIsOpen = false,
    glossaryList,
    populateList,
    findTerm,
    showGlossary,
    hideGlossary;

// Builds the List in the glossary slide panel
populateList = function(terms) {
    var itemTemplate = '<li id="glossary-list-item" class="glossary__item">' +
                        '<div class="js-accordion_header accordion__header">' +
                        '<h4 class="glossary-term"></h4>' +
                        '<button class="button button--secondary accordion__button js-accordion_button"></button>' +
                        '</div>' +
                        '<p class="glossary-definition js-accordion_item"></p>' +
                        '</li>';
    var options = {
        item: itemTemplate,
        valueNames: ['glossary-term'],
        listClass: 'glossary__list',
        searchClass: 'glossary__search'
    };
    glossaryList = new List('glossary', options, terms);
    glossaryList.sort('glossary-term', {order: 'asc'});
};

populateList(terms);

// Adding title to all terms and lowercasing all terms
$('.term').each(function(){
    var thisTerm = $(this).attr('data-term').toLowerCase();
    $(this).attr('title', 'Click to define')
        .attr('tabindex', 0)
        .attr('data-term', thisTerm);
})

findTerm = function(term) {
    $('.glossary__search').val(term);
    // Highlight the term and remove other highlights
    $('.term--highlight').removeClass('term--highlight');
    $('span[data-term="' + term + '"]').addClass('term--highlight');
    glossaryList.filter(function(item) {
      return item._values['glossary-term'].toLowerCase() === term;
    });
    // Hack: Expand text for selected item
    glossaryList.search();
    _.each(glossaryList.visibleItems, function(item) {
      var $elm = $(item.elm).find('div');
      if ($elm.hasClass('accordion--collapsed')) {
        $elm.find('.accordion__button').click();
      }
    });
};

// Opens the glossary
showGlossary = function() {
    $('.glossary').addClass('is-open').attr('aria-hidden','false');
    $('#glossary-toggle').addClass('active');
    $('#glossary-search').focus();
    glossaryIsOpen = true;
};

// Hides the glossary
hideGlossary = function() {
    $('.glossary').removeClass('is-open').attr('aria-hidden','true');
    $('.term--highlight').removeClass('term--highlight');
    $('#glossary-toggle').removeClass('active');
    glossaryIsOpen = false;
};

module.exports = {
    init: function() {
        glossaryLink.on('click keypress', function(e){
            if (e.which === 13 || e.type === 'click') {
                var dataTerm = $(this).data('term');
                showGlossary();
                findTerm(dataTerm);
            }
        });

        $('#glossary-toggle, #hide-glossary').click(function(){
            if (glossaryIsOpen) {
                hideGlossary();
            } else {
                showGlossary();
            }
        });

        $(document.body).on('keyup', function(e) {
            if (e.keyCode == keyboard.key.code('escape')) {
                if (glossaryIsOpen) {
                    hideGlossary();
                    $('#glossary-toggle').focus();
                }
            }
        });

        // Hack: Remove filters applied by clicking a term on new user input
        $('#glossary-search').on('input', function() {
          if (glossaryList.filtered) {
            glossaryList.filter();
          }
        });
    }
};
