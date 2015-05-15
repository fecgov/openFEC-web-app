'use strict';

var $ = require('jquery');

var defaultOpts = {
  placeHolderOptions: {
    'candidates': 'Enter a candidate name',
    'committees': 'Enter a committee name'}
};

function onSelectChange($input, updatedText) {
  $input.attr('placeholder', updatedText);
};

var Search = function($el, opts) {
  var $select = $el.find('select'),
      $input = $el.find('input'),
      settings = $.extend( {}, defaultOpts, opts);

  if (settings.placeHolderOptions) {
    $select.on('change', function(ev) {
      ev.preventDefault();
      var value = $(this).val();
      onSelectChange($input, settings.placeHolderOptions[value])
    });
  }

}

module.exports = Search;
