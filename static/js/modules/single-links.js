'use strict';

var events = require('./events.js');

var singleClickHandler = function(e) {
  e.preventDefault();
  var id = $(this).data('id');
  var category = $(this).data('category');

  if ( category === 'candidate' ) {
    events.emit('load:singleEntity', {
      category: 'candidates',
      filters: {
        'candidate_id': id
      }
    });
  } else if ( category === 'committee' ) {
    console.log('cmte');
    events.emit('load:singleEntity', {
      category: 'committees',
      filters: {
        'cmte_id': id
      }
    });
  }
}

module.exports = {
  init: function() {
    $('#main').on('click', '.single-link', singleClickHandler);
  }
};
