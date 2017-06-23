'use strict';

var $ = require('jquery');
var _ = require('underscore');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var URI = require('urijs');

function lineNumberFilters() {
  this.filterPanel = new FilterPanel();
  this.filterSet = this.filterPanel.filterSet;

  lineNumberFiltersCheck();

  this.filterSet.$body.on('change', 'input,select', _.debounce(lineNumberFiltersCheck, 250));
}

function lineNumberFiltersCheck() {
  var params = URI.parseQuery(window.location.search);

  if (Number(params.two_year_transaction_period) < 2007) {
    $('.js-line-number-filters').hide();
    $('.js-line-number-message').show();
  }
  else {
    $('.js-line-number-filters').show();
    $('.js-line-number-message').hide();
  }
}

module.exports = {
  lineNumberFilters: lineNumberFilters
};
