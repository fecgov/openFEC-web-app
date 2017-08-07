'use strict';

/* window */

var $ = require('jquery');
var ElectionForm = require('./election-form').ElectionForm;
var ElectionMap = require('./election-map').ElectionMap;

/* ElectionLookupPreview
 * The simpler form of the full ElectionLookup tool, used on the data landing page
 * This component has a map and the state and district selects
*/

function ElectionLookup(selector) {
  this.$elm = $(selector);
  this.$form = this.$elm.find('form');
  this.$state = this.$form.find('[name="state"]');
  this.$district = this.$form.find('[name="district"]').prop('disabled', true);
  this.$submit = this.$form.find('[type="submit"]');

  this.districts = 0;

  this.$state.on('change', this.handleStateChange.bind(this));
  this.$district.on('change', this.handleDistrictChange.bind(this));

  // Show an option for the senate page in the district seelct
  this.showSenateOption = true;

  this.$map = $('.election-map');
  this.map = new ElectionMap(this.$map.get(0), {
    drawStates: true,
    handleSelect: this.handleSelectMap.bind(this)
  });
}

ElectionLookup.prototype = Object.create(ElectionForm.prototype);
ElectionLookup.constructor = ElectionLookup;

ElectionLookup.prototype.handleSelectMap = function(state, district) {
  this.$state.val(state);
  this.updateDistricts(state);
  if (district && this.hasOption(this.$district, district)) {
    this.$district.val(district);
  }
  this.search();
};

ElectionLookup.prototype.handleDistrictChange = function(e) {
  this.search(e);
  if (e.target.value) {
    this.$submit.html('Go');
    this.$submit.removeClass('button--search--text').addClass('button--go');
  } else {
    this.$submit.html('Search');
    this.$submit.addClass('button--search--text').removeClass('button--go');
  }
};

ElectionLookup.prototype.search = function(e) {
  e && e.preventDefault();
  var self = this;
  this.xhr = $.getJSON(self.getUrl(this.serialize())).done(function(response) {
    // Note: Update district color map before rendering results
    var encodedDistricts = self.encodeDistricts(response.results);
    self.map.drawDistricts(encodedDistricts);
  });
};

module.exports = {
  ElectionLookup: ElectionLookup,
};
