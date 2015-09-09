'use strict';

/* global require, module */

var $ = require('jquery');
var URI = require('URIjs');

var helpers = require('./helpers');

function ElectionSummary(selector, opts) {
  this.$elm = $(selector);
  this.opts = opts;

  this.$count = this.$elm.find('.count');
  this.$receipts = this.$elm.find('.receipts');
  this.$disbursements = this.$elm.find('.disbursements');

  this.fetch();
  this.$elm.find('a.button--election').attr('href', this.buildUrl());
}

ElectionSummary.prototype.buildUrl = function() {
  var parts = [this.opts.office, this.opts.state, this.opts.district, this.opts.cycle]
    .filter(function(part) {
      return !!part;
    })
    .concat('')
    .join('/');
  return URI(parts).toString();
};

ElectionSummary.prototype.fetch = function() {
  var url = helpers.buildUrl(['elections', 'summary'], this.opts);
  $.getJSON(url).done(this.draw.bind(this));
};

ElectionSummary.prototype.draw = function(response) {
  this.$count.text(response.count);
  this.$receipts.text(helpers.currency(response.receipts));
  this.$disbursements.text(helpers.currency(response.disbursements));
};

module.exports = {ElectionSummary: ElectionSummary};
