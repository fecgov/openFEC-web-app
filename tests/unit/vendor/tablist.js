'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var tablist = require('../../../static/js/vendor/tablist');

describe('show', function() {
  var fixture;
  before(function() {
    fixture = $('<div id="fixtures"></div>');
    $('body').append(this.fixture);
  });

  beforeEach(function() {
    fixture.empty().append(
      '<ul role="tablist" data-name="tab">' +
        '<li><a role="tab" data-name="tab0">0</a></li>' +
        '<li><a role="tab" data-name="tab1">1</a></li>' +
      '</ul>'
    );
  });
});
