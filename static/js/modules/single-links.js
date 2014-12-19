'use strict';

var events = require('./events.js');

var singleClickHandler = function(e) {
  e.preventDefault();
  var id = $(this).data('id');
  var category = $(this).data('category');

  events.emit('load:singleEntity', {
    category: category + 's',
    id: id
  });
}

module.exports = {
  init: function() {
    $('#main').on('click', '.single-link', singleClickHandler);
  }
};
