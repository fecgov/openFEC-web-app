'use strict'

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');
var urls = require('fec-style/js/urls');
var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var filterTags = require('fec-style/js/filter-tags');

var ao_template = require('../../templates/legal-search/ao.hbs');

// Just lifted this from calendar-helpers.js
function getUrl(path, params) {
  return URI(window.API_LOCATION)
    .path(Array.prototype.concat(window.API_VERSION, path || [], '').join('/'))
    .addQuery({
      api_key: window.API_KEY,
      per_page: 500
    })
    .addQuery(params || {})
    .toString();
}

function LegalSearch() {
  this.filterPanel = new FilterPanel();
  this.url = URI(getUrl(['legal', 'search']));
  this.params = null;
  this.$results = $('.js-results');
  this.$widgets = $('.js-data-widgets');

  // TODO: remove hard-coded value
  this.type = 'advisory_opinions';

  // Listen for change events but don't listen for clicks
  this.filterPanel.$form.on('change', this.handleChange.bind(this));
  // Removing click listener because it triggers events that bubble
  this.filterPanel.$form.off('click');
  $(window).on('popstate', this.handleChange.bind(this));

  this.updateDOM();
}

LegalSearch.prototype.updateDOM = function() {
  // Adds the tag area
  var tagList = new filterTags.TagList({
    resultType: 'results',
    showResultCount: true
  });
  this.$widgets.find('.js-filter-tags').prepend(tagList.$body);

  // Remove the submit button and form action because we will do everything async
  this.filterPanel.$body.find('[type="submit"]').remove();
  this.filterPanel.filterSet.$body.attr('action', '');
};

LegalSearch.prototype.handleChange = function() {
  // Update the query params in the url and call the fetch method
  var params = this.cleanFilters();
  if (_.isEqual(params, this.params)) {
    return;
  }
  var url = this.url.clone().addQuery(params || {}).toString();
  urls.pushQuery(this.filterPanel.filterSet.serialize(), this.filterPanel.filterSet.fields);
  this.params = params;
  this.fetch(url);
};

LegalSearch.prototype.cleanFilters = function() {
  var params = this.filterPanel.filterSet.serialize();
  // Hack to clear values set to "0" which trigger an error on the API
  // Maybe there's a better solution?
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      if (params[key][0] === '0') {
        delete params[key];
      }
    }
  }

  return params;
};

LegalSearch.prototype.fetch = function(url) {
  // Empty the results div and call the API
  this.$results.empty();
  $.getJSON(url, this.renderResults.bind(this));
};

LegalSearch.prototype.renderResults = function(data) {
  var self = this;
  var results = data[this.type];
  results.forEach(function(ao) {
    var result = ao_template(ao);
    self.$results.append(result);
  });

  // Remove the loading states
  $('.is-loading').removeClass('is-loading').addClass('is-successful');
};

LegalSearch.prototype.updatePagination = function() {
  // TODO Change the pagination values and such
};

module.exports = {LegalSearch: LegalSearch};
