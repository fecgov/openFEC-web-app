'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var $ = require('jquery');

var tablist = require('../../../static/js/vendor/tablist');

describe('tablist', function() {
  var fixture;
  before(function() {
    fixture = $('<div id="fixtures"></div>');
    $('body').append(this.fixture);
  });

  describe('init', function() {
    it('should show all tab panels if there are no tabs', function() {
      fixture.empty().append(
        '<ul role="tablist" data-name="tab"></ul>' +
        '<section role="tabpanel" aria-hidden></section>'
      );

      tablist.init();

      expect($('[role="tabpanel"]').attr('aria-hidden')).to.be.undefined;
    });
  });
});
