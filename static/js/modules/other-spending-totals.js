'use strict';

/* global require, context */

var $ = require('jquery');
var helpers = require('../modules/helpers');

var pathMap = {
  'independentExpenditures': '/schedules/schedule_e/by_candidate/',
  'communicationCosts': '/communication_costs/by_candidate/',
  'electioneering': '/electioneering/by_candidate/'
};

function otherSpendingTotals(schedule) {
  this.url = helpers.buildUrl(
    pathMap[schedule],
    {
      candidate_id: context.candidateID,
      cycle: context.cycle,
      election_full: context.electionFull,
      per_page: 100
    }
  );

  this.init();
}

otherSpendingTotals.prototype.fetchData = function() {
  var self = this;
  $.getJSON(this.url).done(function(data) {
    self.data = data;
  });
};

otherSpendingTotals.prototype.init = function() {
  this.fetchData();
};



otherSpendingTotals.prototype.sum = function(data) {
  var sum = 0;
  for (i = 0; i < data; i++) {
    sum += data[i];
  }
};

module.exports = otherSpendingTotals;
