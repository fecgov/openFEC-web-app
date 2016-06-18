'use strict';

var $ = require('jquery');
var helpers = require('./helpers');

function TopList(selector, dataType) {
  this.$element = $(selector);
  this.$topRaising = this.$element.find('.js-top-raising');
  this.$topSpending = this.$element.find('.js-top-spending');
  this.$toggles = this.$element.find('button');
  this.raisingID = this.$topRaising.attr('id');
  this.spendingID = this.$topSpending.attr('id');
  this.dataType = dataType;

  this.setAria();
  helpers.zeroPad(this.$topRaising, '.figure__number', '.figure__decimals');

  this.$toggles.on('click', this.handleToggle.bind(this));
}

TopList.prototype.handleToggle = function(e) {
  var $target = $(e.target);
  this.$toggles.removeClass('is-active');
  $target.addClass('is-active');
  if ($target.attr('aria-controls') === this.spendingID) {
    this.showSpending();
  } else {
    this.showRaising();
  }
};

TopList.prototype.setAria = function() {
  this.$topRaising.attr('aria-hidden', 'false');
  this.$topSpending.attr('aria-hidden', 'true');
};

TopList.prototype.showRaising = function() {
  this.$topRaising.attr('aria-hidden', 'false');
  this.$topSpending.attr('aria-hidden', 'true');
};

TopList.prototype.showSpending = function() {
  this.$topSpending.attr('aria-hidden', 'false');
  this.$topRaising.attr('aria-hidden', 'true');
  helpers.zeroPad(this.$topSpending, 'li', '.figure__number', '.figure__decimals');
};


module.exports = {
  TopList: TopList
};
