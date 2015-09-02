'use strict';

/* global require, module */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('./tables');
var helpers = require('../modules/helpers');

var filingsTemplate = require('../../templates/filings.hbs');

var renderFilingsModal = tables.modalRenderFactory(
  filingsTemplate,
  function(row) {
    var url = helpers.buildUrl(
      ['committee', row.committee_id, 'reports'],
      {beginning_image_number: row.beginning_image_number}
    );
    return $.getJSON(url).then(function(response) {
      var result = response.results.length ?
        response.results[0] :
        {};
      return _.extend({}, row, result);
    });
  }
);

module.exports = {
  renderFilingsModal: renderFilingsModal
};
