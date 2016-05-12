'use strict';

/* global context */

var $ = require('jquery');
var _ = require('underscore');

var tables = require('../modules/tables');
var columnHelpers = require('../modules/column-helpers');
var columns = require('../modules/columns');
var helpers = require('../modules/helpers');
var URI = require('urijs');

var candidatesTemplate = require('../../templates/candidates-office.hbs');

var columnGroups = {
  president: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'receipts', 'disbursements', 'trigger']),
  senate: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'state', 'receipts', 'disbursements', 'trigger']),
  house: columnHelpers.getColumns(columns.candidateOffice, ['name', 'party', 'state', 'district', 'receipts', 'disbursements', 'trigger']),
};

var defaultSort = {
  president: 2,
  senate: 3,
  house: 4
};

var renderModal = tables.modalRenderFactory(
  candidatesTemplate,
  function(row) {
    // Parse all of the time-related variables
    var query = URI.parseQuery(window.location.search);
    var electionYear = query.election_year;
    var cycle = query.cycle || query.election_year;
    var electionFull = query.election_full === 'true' ? true : false;
    var timePeriod = helpers.getTimePeriod(electionYear, cycle, electionFull, row.office);

    // Build the URL and make a call to the history endpoint
    var committeeUrl = helpers.buildUrl(
      ['candidate', row.candidate_id, 'committees', 'history', cycle],
      {'election_full': query.election_full}
    );

    return $.getJSON(committeeUrl).then(function(response) {
      var results = response.results.length ?
        response.results :
        {};
      // Sort the P and A committees
      var principalCommittees = [],
          authorizedCommittees = [];
      results.forEach(function(result){
        if (result.designation === 'P') {
          principalCommittees.push(result);
        } else if (result.designation === 'A') {
          authorizedCommittees.push(result);
        }
      });
      var committees = {
        principal: principalCommittees,
        authorized: authorizedCommittees
      };
      return _.extend({}, row, {committees: committees, query: query, time_period: timePeriod});
    });
  }
);

$(document).ready(function() {
  var $table = $('#results');
  new tables.DataTable($table, {
    title: 'Candidates for ' + context.office,
    path: ['candidates', 'totals'],
    query: {office: context.office.slice(0, 1).toUpperCase()},
    columns: columnGroups[context.office],
    order: [[defaultSort[context.office], 'desc']],
    useFilters: true,
    useExport: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: renderModal
    }
  });
});
