'use strict';

/* global require, module */

var $ = require('jquery');
var URI = require('URIjs');

var helpers = require('./helpers');

function buildUrl(opts) {
  var parts = ['elections', opts.office, opts.state, opts.district, opts.cycle]
    .filter(function(part) {
      return !!part;
    })
    .concat('')
    .join('/');
  return URI(parts).toString();
}

function ElectionSummary(selector, opts) {
  this.$elm = $(selector);
  this.opts = opts;

  this.$count = this.$elm.find('.js-count');
  this.$receipts = this.$elm.find('.js-receipts');
  this.$disbursements = this.$elm.find('.js-disbursements');

  this.fetch();
  this.$elm.find('.js-election-url').attr('href', buildUrl(this.opts));
}

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
