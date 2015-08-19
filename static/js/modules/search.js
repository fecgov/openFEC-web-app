'use strict';

var $ = require('jquery');

var events = require('./events.js');

var defaultOpts = {
  placeHolderOptions: {
    'candidates': 'Search candidates',
    'committees': 'Search committees'
  }
};

function onSelectChange($input, updatedText) {
  $input.attr('placeholder', updatedText).attr('aria-label', updatedText);
};

var Search = function($el, opts) {
  var $select = $el.find('.js-search-type'),
      $input = $el.find('input[type="text"]'),
      settings = $.extend( {}, defaultOpts, opts);

  if (settings.placeHolderOptions) {
    $select.on('change', function(ev) {
      ev.preventDefault();
      var value = $(this).val();
      events.emit('searchTypeChanged', {type: value});
      onSelectChange($input, settings.placeHolderOptions[value]);
    });
  }
};

module.exports = Search;
