'use strict';

/* global context */

var $ = require('jquery');
var _ = require('underscore');
var helpers = require('../modules/helpers');

var TOP_ROW = _.template(
  '<tr class="simple-table__row">' +
    '<td class="simple-table__cell">{{ name }}</td>' +
    '<td class="simple-table__cell t-right-aligned">{{ amount }}</td>' +
    '<td class="simple-table__cell"><div class="bar-container">' +
      '<div class="value-bar" data-value="{{ value }}" data-party="{{ party }}"></div>' +
    '</div></td>',
    {interpolate: /\{\{(.+?)\}\}/g}
);

// Store candidate office letters for to look up when a chart category is a candidate
var candidateCategories = ['P', 'S', 'H'];

function TopEntities(elm, type) {
  this.$elm = $(elm);
  this.type = type;
  this.$table = this.$elm.find('tbody');
  this.category = this.$elm.data('category');
  this.cycle = this.$elm.data('cycle');
  this.init();
  $('.js-cycle').on('change', this.handleCycleChange.bind(this));
  this.$elm.find('.js-category').on('change', this.handleCategoryChange.bind(this));
}

TopEntities.prototype.init = function() {
  if (candidateCategories.indexOf(this.category) > -1) {
    this.basePath = ['candidates', 'totals'];
  } else {
    this.basePath = ['totals', this.category];
  }
  this.baseQuery = {
    sort: '-receipts',
    per_page: 10,
    sort_hide_null: true,
    cycle: this.cycle
    // cycle: something
  };
  this.maxValue = Number(this.$table.find('tr:first-child .value-bar').data('value'));
  this.drawBars();
};

TopEntities.prototype.handleCycleChange = function(e) {
  e.preventDefault();
  var cycle = e.target.value;
  this.cycle = cycle;
  if (this.category === 'candidates') {
      this.currentQuery = _.extend({}, this.baseQuery, {
      cycle: this.cycle,
      office: this.office
    });
  } else {
    this.currentQuery = _.extend({}, this.baseQuery, {
      cycle: this.cycle
    });
  }
  this.loadData(this.currentQuery);
  // update query
};

TopEntities.prototype.handleCategoryChange = function(e) {
  e.preventDefault();
  var category = e.target.value;
  if (candidateCategories.indexOf(category) > -1) {
    this.basePath = ['candidates', 'totals'];
    this.category = 'candidates';
    this.office = category;
    this.currentQuery = _.extend({}, this.baseQuery, {
      office: this.office,
    });
   } else {
    this.basePath = ['totals', category];
    this.category = category;
    this.currentQuery = this.baseQuery;
  }
  this.loadData(this.currentQuery);
};

TopEntities.prototype.handlePagination = function(e) {
  // Handle pagination
};

TopEntities.prototype.loadData = function(query) {
  var self = this;
  $.getJSON(
    helpers.buildUrl(this.basePath, query)
  ).done(function(response) {
    self.$table.empty();
    _.each(response.results, function(result) {
      var data;
      if (self.category === 'candidates') {
        data = {
          name: result.name,
          id: result.candidate_id,
          amount: helpers.currency(result.receipts),
          value: result.receipts,
          party: result.party
        };
      } else {
        data = {
          name: result.committee_name,
          id: result.committee_id,
          amount: helpers.currency(result.receipts),
          value: result.receipts,
          party: ''
        };
      }
      self.$table.append(TOP_ROW(data));
    });

    // Set max value if it's the first page
    if (response.pagination.page === 1) {
      self.maxValue = response.results[0].receipts;
    }
    self.drawBars();
  });
};


TopEntities.prototype.drawBars = function() {
  var maxValue = this.maxValue;
  this.$table.find('.value-bar').each(function(){
    var width = Number(this.getAttribute('data-value')) / maxValue;
    this.style.width = String(width * 100) + '%';
  });
};

new TopEntities('.js-top-entities', context.type);
