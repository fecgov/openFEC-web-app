'use strict';

/* global window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('urijs');

var Filter = require('./filters').Filter;

var KEYCODE_ENTER = 13;

function FilterSet(elm) {
  this.$body = $(elm);
  this.$clear = this.$body.find('.js-clear-filters');

  this.$clear.on('click keypress', this.handleClear.bind(this));

  this.filters = {};
  this.fields = [];
}

FilterSet.prototype.activate = function() {
  var query = URI.parseQuery(window.location.search);
  this.filters = _.chain(this.$body.find('.filter'))
    .map(function(elm) {
      var filter = Filter.build($(elm)).fromQuery(query);
      return [filter.name, filter];
    })
    .object()
    .value();
  this.fields = _.chain(this.filters)
    .pluck('fields')
    .flatten()
    .value();
  return this;
};

FilterSet.prototype.serialize = function() {
  return _.reduce(this.$body.serializeArray(), function(memo, val) {
    if (val.value && val.name.slice(0, 1) !== '_') {
      if (memo[val.name]) {
        memo[val.name].push(val.value);
      } else{
        memo[val.name] = [val.value];
      }
    }
    return memo;
  }, {});
};

FilterSet.prototype.handleClear = function(e) {
  if (e.which === KEYCODE_ENTER || e.type === 'click') {
    this.clear();
    $(e.target).focus();
  }
};

FilterSet.prototype.clear = function() {
  _.each(this.filters, function(filter) {
    filter.setValue();
  });
};

module.exports = {FilterSet: FilterSet};
