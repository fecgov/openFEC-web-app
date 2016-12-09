'use strict';

/* global require */
require('jquery.inputmask');
require('jquery.inputmask/dist/inputmask/inputmask.date.extensions.js');
require('jquery.inputmask/dist/inputmask/inputmask.numeric.extensions.js');

var $ = require('jquery');
var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;

$(function () {
  new FilterPanel();

  $('.js-date-mask').inputmask('mm/dd/yyyy');
});
