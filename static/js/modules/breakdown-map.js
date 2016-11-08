'use strict';

var $ = require('jquery');
var _ = require('underscore');
var helpers = require('../modules/helpers');
var moment = require('moment');
var maps = require('../modules/maps');
var events = require('fec-style/js/events');
var tables = require('../modules/tables');
var columnHelpers = require('../modules/column-helpers');

// Refactor to share code with committee-single.js
var stateColumns = [
  {
    data: 'state_full',
    width: '50%',
    className: 'all',
    render: function(data, type, row, meta) {
      var span = document.createElement('span');
      span.textContent = data;
      span.setAttribute('data-state', data);
      span.setAttribute('data-row', meta.row);
      return span.outerHTML;
    }
  },
  {
    data: 'total',
    width: '50%',
    className: 'all',
    orderSequence: ['desc', 'asc'],
    render: columnHelpers.buildTotalLink(['receipts', 'individual-contributions'], function(data, type, row) {
      return {
        contributor_state: row.state,
      };
    })
  },
];

function BreakdownMap(elm, type) {
  this.$elm = $(elm);
  this.type = type;
  this.category = this.$elm.data('category');
  this.cycle = this.$elm.data('cycle');

  this.$table = this.$elm.find('.js-table');
  this.$dates = this.$elm.find('.js-dates');
  this.$map = this.$elm.find('.js-map');
  this.init();

  $('.js-cycle').on('change', this.handleCycleChange.bind(this));
  this.$elm.find('.js-category').on('change', this.handleCategoryChange.bind(this));
}

BreakdownMap.prototype.init = function() {
  this.basePath = ['schedules', 'schedule_a', 'by_state', 'totals'];

  this.baseQuery = {
    committee_type: 'P',
    per_page: 100,
    sort_hide_null: true,
    cycle: this.cycle
  };

  this.loadData(this.baseQuery);
};

BreakdownMap.prototype.handleCycleChange = function(e) {
  e.preventDefault();
  this.cycle = e.target.value;
  if (this.category === 'candidates') {
      this.currentQuery = _.extend({}, this.baseQuery, {
      cycle: this.cycle,
      office: this.office,
      page: 1
    });
  } else {
    this.currentQuery = _.extend({}, this.baseQuery, {
      cycle: this.cycle,
      page: 1
    });
  }
  this.loadData(this.currentQuery);
  this.updateDates();
};

BreakdownMap.prototype.handleCategoryChange = function(e) {
  // Re do everything when the category filter changes
};

BreakdownMap.prototype.loadData = function(query) {
  var self = this;

  $.getJSON(
    helpers.buildUrl(this.basePath, query)
  ).done(function(response) {
    self.buildMap(response);
  });

  this.buildTable();
};

BreakdownMap.prototype.buildMap = function(data) {
  var self = this;
  var opts = {
    width: 350,
    height: 300,
    scale: 400,
    translate: [160, 120],
    min: null,
    max: null,
    addLegend: true,
    addTooltips: true,
  };
  maps.stateMap(this.$map, data, opts);

  events.on('state.table', function(params) {
    self.highlightRowAndState(params.state, false);
  });

  this.$map.on('click', 'path[data-state]', function() {
    var state = $(this).attr('data-state');
    events.emit('state.map', {state: state});
  });
};

BreakdownMap.prototype.buildTable = function() {
  var self = this;

  new tables.DataTable(this.$table, {
    path: this.basePath,
    query: this.baseQuery,
    columns: stateColumns,
    dom: 't',
    order: [[1, 'desc']],
    paging: false,
    scrollY: 400,
    scrollCollapse: true
  });
  events.on('state.map', function(params) {
    self.highlightRowAndState(params.state, true);
  });
  this.$table.on('click', 'tr', function() {
    events.emit('state.table', {
      state: $(this).find('span[data-state]').attr('data-state')
    });
  });
};

BreakdownMap.prototype.highlightRowAndState = function(state, scroll) {
  // Consider refactoring to share code with committee-single.js
  var $scrollBody = this.$table.closest('.dataTables_scrollBody');
  var $row = $scrollBody.find('span[data-state="' + state + '"]');

  if ($row.length > 0) {
    maps.highlightState($('.state-map'), state);
    $scrollBody.find('.row-active').removeClass('row-active');
    $row.parents('tr').addClass('row-active');
    if (scroll) {
      $scrollBody.animate({
        scrollTop: $row.closest('tr').height() * parseInt($row.attr('data-row'))
      }, 500);
    }
  }
};

BreakdownMap.prototype.destroyTableAndMap = function() {
  // Remove the table and map from the DOM
};

BreakdownMap.prototype.updateDates = function() {
  var today = new Date();
  var startDate = '01/01/' + String(this.cycle - 1);
  var endDate = this.cycle !== today.getFullYear() ? '12/31/' + this.cycle : moment(today, 'DD/MM/YYYY');
  this.$dates.html(startDate + '–' + endDate);
};

module.exports = {BreakdownMap: BreakdownMap};
