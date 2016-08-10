'use strict';

var $ = require('jquery');
var tables = require('./tables');
var URI = require('urijs');

/* TableSwitcher
 * For switching between efile and processed results
 *
 * container: container that contains the tables
 * control: the component that triggers the change
 */

function TableSwitcher(container, control, processedOpts, efileOpts) {
  this.$container = $(container);
  this.$control = $(control);
  this.$processedTable = this.$container.find('#results');
  this.$efilingTable = this.$container.find('#efiling-results');

  this.processedOpts = processedOpts;
  this.efileOpts = efileOpts;
  this.$control.on('change', this.handleChange.bind(this));
}

TableSwitcher.prototype.init = function() {
  var query = URI.parseQuery(window.location.search);
  if (query.dataType === 'efilings') {
    this.buildEfilingTable();
  } else {
    this.buildProcessedTable();
  }
};

TableSwitcher.prototype.handleChange = function(e) {
  var $target = $(e.target);
  var newTable = $target.val();
  if (newTable === 'efiling') {
    this.buildEfilingTable();
  } else {
    this.buildProcessedTable();
  }
};

TableSwitcher.prototype.buildEfilingTable = function() {
  if (this.processedTable) {
    this.processedTable.destroy();
  }
  this.efilingTable = new tables.DataTable(this.$efilingTable, this.efilingOpts);
  this.$efilingTable.attr('aria-hidden', false);
  this.$processedTable.attr('aria-hidden', true);
};

TableSwitcher.prototype.buildProcessedTable = function() {
  if (this.efilingTable) {
    this.efilingTable.destroy();
  }
  new tables.DataTable(this.$processedTable, this.processedOpts);
  this.$efilingTable.attr('aria-hidden', true);
  this.$processedTable.attr('aria-hidden', false);
};

TableSwitcher.prototype.switchTable = function() {

};

module.exports = {TableSwitcher: TableSwitcher};
