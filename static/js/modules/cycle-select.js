'use strict';

/* global window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('urijs');

function CycleSelect(elm) {
  this.$elm = $(elm);
  this.$elm.on('change', this.handleChange.bind(this));
}

CycleSelect.build = function($elm) {
  var location = $elm.data('cycle-location');
  if (location === 'query') {
    return new QueryCycleSelect($elm);
  } else if (location === 'path') {
    return new PathCycleSelect($elm);
  }
};

CycleSelect.prototype.handleChange = function() {
  this.setUrl(this.nextUrl(this.$elm.val()));
};

CycleSelect.prototype.setUrl = function(url) {
  window.location.href = url;
};

function QueryCycleSelect() {
  CycleSelect.apply(this, _.toArray(arguments));
}

QueryCycleSelect.prototype = Object.create(CycleSelect.prototype);

QueryCycleSelect.prototype.nextUrl = function(cycle) {
  return URI(window.location.href)
    .removeQuery('cycle')
    .addQuery({cycle: cycle})
    .toString();
};

function PathCycleSelect() {
  CycleSelect.apply(this, _.toArray(arguments));
}

PathCycleSelect.prototype = Object.create(CycleSelect.prototype);

PathCycleSelect.prototype.nextUrl = function(cycle) {
  var uri = URI(window.location.href);
  var path = uri.path()
    .replace(/^\/|\/$/g, '')
    .split('/')
    .slice(0, -1)
    .concat([cycle])
    .join('/')
    .concat('/');
  return uri.path(path).toString();
};

module.exports = {CycleSelect: CycleSelect};
