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

    function getCommittees() {
      // Build the URL and make a call to the history endpoint
      var url = helpers.buildUrl(
        ['candidate', row.candidate_id, 'committees', 'history', cycle],
        {'election_full': query.election_full}
      );

      return $.getJSON(url).then(function(response) {
        var results = response.results.length ?
          response.results :
          {};
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
        return {committees: committees, query: query, time_period: timePeriod};
      });
    }

    function getFilings() {
      var url = helpers.buildUrl(
        ['candidate', row.candidate_id, 'filings'],
        {form_type: 'F2'}
      );
      return $.getJSON(url).then(function(response) {
        var results = response.results.length ?
          response.results :
          {};
        return results[0];
      });
    }

    return $.when(getCommittees(), getFilings()).then(function(data1, data2) {
      var newData = {
        committees: data1,
        last_form_2: data2,
        query: query,
        time_period: timePeriod
      };
      return _.extend({}, row, newData);
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
