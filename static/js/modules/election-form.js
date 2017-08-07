'use strict';

var _ = require('underscore');

var helpers = require('./helpers');
var utils = require('./election-utils');

var districts = require('../data/stateDistricts.json');

var districtTemplate = require('../../templates/districts.hbs');

function serializeObject($form) {
  return _.chain($form.serializeArray())
    .map(function(obj) {
      return [obj.name, obj.value];
    })
    .object()
    .value();
}

function ElectionForm() {
}

ElectionForm.prototype.hasOption = function($select, value) {
  return $select.find('option[value="' + value + '"]').length > 0;
};

ElectionForm.prototype.handleZipChange = function() {
  this.$state.val('').change();
  this.$district.val('');
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
  this.districts = districts[state] ? districts[state].districts : 1;
  this.$district
    .html(districtTemplate({
      districts: _.range(1, this.districts + 1),
      senate: this.showSenateOption
    }))
    .val('')
    .prop('disabled', !(state && this.districts));
};

ElectionForm.prototype.getUrl = function(query) {
  return helpers.buildUrl(['elections', 'search'], query);
};

ElectionForm.prototype.serialize = function() {
  var params = serializeObject(this.$form);
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
