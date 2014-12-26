'use strict';

var search = require('./modules/search.js');
var api = require('./modules/api.js');
var navs = require('./modules/navs.js');
var singleEntity = require('./modules/single-entity.js');
var tmpls = require('./modules/tmpls.js');
var filters = require('./modules/filters.js');
var urls = require('./modules/urls.js');
var tables = require('./modules/tables.js');
var progress = require('./modules/progress.js');
var errors = require('./modules/errors.js');
var router = require('./modules/router.js');
var typeahead = require('./modules/typeahead.js');
//var mocks = require('../../tests/mocks/mocks.js');

api.init();
search.init();
navs.init();
singleEntity.init();
tmpls.init();
filters.init();
urls.init();
tables.init();
progress.init();
errors.init();
router.init();
typeahead.init();

$(document).ready(function() {
    $('body').addClass('js-initialized');

    // I'm leaving these comments in place because they are useful in 
    // writing/debugging tests off of a local environment and it gets 
    // stripped out when Browserify condenses the JS into a 
    // production version. [TS]

    //mocks.getCommitteeResults();
    //mocks.getCandidateResults();
    //mocks.getCommitteeRecords();
    //mocks.getCandidates();
    //mocks.getCandidatesPage1();
    //mocks.getCandidatesPage2();
    //mocks.getCommittees();
    //mocks.getCommitteesPage1();
    //mocks.getCommitteesPage2();
    //mocks.getCommitteesHouse();
});
