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
