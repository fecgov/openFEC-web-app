'use strict';

var _ = require('underscore');

var helpers = require('./helpers');
var utils = require('./election-utils');

var districts = require('../data/stateDistricts.json');
var districtTemplate = require('../../templates/districts.hbs');

/* ElectionForm
 * Base class for constructing election lookup tools
 * Both the ElectionSearch and ElectionLookup inherit from this class
 * It handles all logic around showing districts for the district select
 */
function ElectionForm() { }

ElectionForm.prototype.hasOption = function($select, value) {
  return $select.find('option[value="' + value + '"]').length > 0;
};

ElectionForm.prototype.handleStateChange = function() {
  var state = this.$state.val();
  this.updateDistricts(state);
  if (state && this.$zip) {
    this.$zip.val('');
  }

  this.search();
};

ElectionForm.prototype.updateDistricts = function(state) {
  state = state || this.$state.val();
  this.districts = districts[state] ? districts[state].districts : 0;
  if (this.districts) {
    this.$district
      .html(districtTemplate({
        districts: _.range(1, this.districts + 1),
        senate: this.showSenateOption
      }))
      .val('')
      .prop('disabled', false);
  } else if (this.showSenateOption) {
    // When a state only has one house district, like Alaska, districts will be empty
    // This is a problem for the ElectionLookup where you need to have an option to
    // navigate to the house page.
    // If showSenateOption is true, we also want to show an at-large house district
    this.$district
      .html(districtTemplate({
        districts: null,
        atLargeHouse: true,
        senate: this.showSenateOption
      }))
      .val('')
      .prop('disabled', false);
  } else {
    this.$district.prop('disabled', true);
  }

};

ElectionForm.prototype.getUrl = function(query) {
  return helpers.buildUrl(['elections', 'search'], query);
};

ElectionForm.prototype.serialize = function() {
  var params = _.chain(this.$form.serializeArray())
    .map(function(obj) {
      return [obj.name, obj.value];
    })
    .object()
    .value();
  return _.extend(helpers.filterNull(params));
};

ElectionForm.prototype.encodeDistricts = function(results) {
  // Takes a JSON results object and returns a list of encoded districts
  var encoded = _.chain(results)
    .filter(function(result) {
      return result.office === 'H';
    })
    .map(function(result) {
      return utils.encodeDistrict(result.state, result.district);
    })
    .value();
  var state = this.$state.val();
  var district = this.$district.val();
  if (state) {
    encoded.push(utils.encodeDistrict(state, district));
  }
  return _.unique(encoded);
};

module.exports = {
  ElectionForm: ElectionForm
};
