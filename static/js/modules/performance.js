'use strict';

/* global require, window, document, perfBar */

var _ = require('underscore');

require('perfbar/build/perfbar');

var performanceBudgets = {
  'loadTime': {
    max: 3000
  },
  'latency': {
    max: 10000
  },
  'FirstPaint': {
    max: 150
  },
  'frontEnd': {
    max: 1200
  },
  'backEnd': {
    max: 300
  },
  'large_search_loaded': {
    max: 400
  }
};

// Performance metrics
var perf = {
  bar: function() {
    var i,
        ilen,
        mark,
        existingMarks = {},
        filteredMarks = [],
        marks = window.performance &&
          window.performance.getEntriesByType('mark');

    perfBar.init({
      budget: performanceBudgets
    });

    // Max the duplicates
    _.each(marks, function(mark) {
      var duplicateMark;
      if (mark.name in _.keys(existingMarks)) {
        duplicateMark = existingMarks[mark.name];
        // already exists, check for duplicates.
        existingMarks[mark.name] = _.max([mark, duplicateMark], function(compare) {
          return compare.startTime;
        });
      } else {
        existingMarks[mark.name] = mark;
      }
    });
    filteredMarks = _.values(existingMarks);

    for (i = 0, ilen = filteredMarks.length; i < ilen; i++) {
      mark = filteredMarks[i];
      perfBar.addMetric({
        id: 'mark_' + i,
        label: mark.name,
        unit: 'ms',
        value: Math.floor(mark.startTime),
        budget: performanceBudgets[mark.name] || null
      });
    }
  }
};

module.exports = perf;
