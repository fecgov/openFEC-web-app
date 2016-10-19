'use strict';

/* global context, ga */

var $ = require('jquery');
var _ = require('underscore');
var analytics = require('fec-style/js/analytics');
var helpers = require('../modules/helpers');
var ReactionBox = require('../modules/reaction-box').ReactionBox;
var moment = require('moment');

var TOP_ROW = _.template(
  '<tr class="simple-table__row">' +
    '<td class="simple-table__cell"><a href="{{ url }}">{{ name }}</a></td>' +
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
  this.type = type === 'raising' ? 'receipts' : 'disbursements';
  this.category = this.$elm.data('category');
  this.cycle = this.$elm.data('cycle');

  this.$table = this.$elm.find('tbody');
  this.$dates = this.$elm.find('.js-dates');
  this.$previous = this.$elm.find('.js-previous');
  this.$next = this.$elm.find('.js-next');

  this.init();

  $('.js-cycle').on('change', this.handleCycleChange.bind(this));
  this.$elm.find('.js-category').on('change', this.handleCategoryChange.bind(this));
  this.$elm.find('.js-previous').on('click', this.handlePagination.bind(this, 'previous'));
  this.$elm.find('.js-next').on('click', this.handlePagination.bind(this, 'next'));
}

TopEntities.prototype.init = function() {
  if (candidateCategories.indexOf(this.category) > -1) {
    this.basePath = ['candidates', 'totals'];
  } else {
    this.basePath = ['totals', this.category];
  }
  this.baseQuery = {
    sort: '-' + this.type,
    per_page: 10,
    sort_hide_null: true,
    cycle: this.cycle
  };
  this.maxValue = Number(this.$table.find('tr:first-child .value-bar').data('value'));

  // Store the current query for use in pagination and more
  this.currentQuery = this.baseQuery;
  // If it's a candidate table, add the office to the current query
  if (candidateCategories.indexOf(this.category) > -1) {
    this.currentQuery.office = this.category;
    this.category = 'candidates';
  }

  if (!this.currentQuery.page) {
    this.$previous.addClass('is-disabled');
  }

  this.drawBars();
};

TopEntities.prototype.handleCycleChange = function(e) {
  e.preventDefault();
  var cycle = e.target.value;
  this.cycle = cycle;
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

TopEntities.prototype.handleCategoryChange = function(e) {
  e.preventDefault();
  var category = e.target.value;
  if (candidateCategories.indexOf(category) > -1) {
    this.basePath = ['candidates', 'totals'];
    this.category = 'candidates';
    this.office = category;
    this.currentQuery = _.extend({}, this.baseQuery, {
      office: this.office,
      page: 1
    });
   } else {
    this.basePath = ['totals', category];
    this.category = category;
    this.currentQuery = _.extend({}, this.baseQuery, {
      page: 1
    });
  }
  this.loadData(this.currentQuery);
};

TopEntities.prototype.handlePagination = function(direction) {
  var currentPage = this.currentQuery.page || 1;
  if (direction === 'next') {
    this.currentQuery.page = currentPage + 1;
    this.$previous.removeClass('is-disabled');
  } else if (direction === 'previous' && currentPage > 1) {
    this.currentQuery.page = currentPage - 1;
  } else {
    return;
  }

  this.loadData(this.currentQuery);
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
          amount: helpers.currency(result[self.type]),
          value: result[self.type],
          party: result.party,
          url: helpers.buildAppUrl(['candidate', result.candidate_id], {
            cycle: self.cycle,
            election_full: false
          })
        };
      } else {
        data = {
          name: result.committee_name,
          amount: helpers.currency(result[self.type]),
          value: result[self.type],
          party: '',
          url: helpers.buildAppUrl(['committee', result.committee_id], {
            cycle: self.cycle
          })
        };
      }
      self.$table.append(TOP_ROW(data));
    });

    // Set max value if it's the first page
    if (response.pagination.page === 1) {
      self.maxValue = response.results[0].receipts;
      self.$previous.addClass('is-disabled');
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

TopEntities.prototype.updateDates = function() {
  var today = new Date();
  var startDate = '01/01/' + String(this.cycle - 1);
  var endDate = this.cycle !== today.getFullYear() ? '12/31/' + this.cycle : moment(today, 'DD/MM/YYYY');
  this.$dates.html(startDate + '–' + endDate);
};

new TopEntities('.js-top-entities', context.type);

$('.js-reaction-box').each(function() {
  new ReactionBox(this);
});

$('.js-ga-event').each(function() {
  var eventName = $(this).data('ga-event');
  $(this).on('click', function() {
    if (analytics.trackerExists()) {
      var gaEventData = {
        eventCategory: 'Misc. events',
        eventAction: eventName,
        eventValue: 1
      };
      ga('nonDAP.send', 'event', gaEventData);
    }
  });
});
