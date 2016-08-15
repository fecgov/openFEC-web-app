'use strict';

var $ = require('jquery');
var tables = require('./tables');
var URI = require('urijs');

/* TableSwitcher
 * For switching between efile and processed results
 */

function TableSwitcher(control, opts) {
  this.$control = $(control);
  this.opts = opts;

  this.$control.on('change', this.handleChange.bind(this));
}

TableSwitcher.prototype.init = function() {
  var opts = this.opts[this.$control.find('input:checked').val()];
  this.$control.trigger('table:switch', opts);
};

TableSwitcher.prototype.handleChange = function(e) {
  var $target = $(e.target);
  var opts = this.opts[$target.val()];
  this.$control.trigger('table:switch', opts);
};

module.exports = {TableSwitcher: TableSwitcher};
