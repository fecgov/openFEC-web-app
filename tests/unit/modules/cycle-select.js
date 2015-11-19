'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var $ = require('jquery');
var URI = require('urijs');

require('../setup')();

var CycleSelect = require('../../../static/js/modules/cycle-select').CycleSelect;

describe('filter set', function() {
  before(function() {
    this.$fixture = $('<div id="fixtures"></div>');
    $('body').append(this.$fixture);
  });

  beforeEach(function() {
    sinon.stub(CycleSelect.prototype, 'setUrl');
  });

  afterEach(function() {
    CycleSelect.prototype.setUrl.restore();
  });

  describe('query cycle select', function() {
    beforeEach(function() {
      this.$fixture.empty().append(
        '<select class="cycle-select" data-cycle-location="query">' +
          '<option value="2012"></option>' +
          '<option value="2014"></option>' +
          '<option value="2016"></option>' +
        '</select>'
      );
      this.cycleSelect = CycleSelect.build($('#fixtures select'));
    });

    it('changes the query string on change', function() {
      this.cycleSelect.$elm.val('2014').change();
      expect(CycleSelect.prototype.setUrl).to.have.been.calledWith(window.location.href + '?cycle=2014');
    });
  });

  describe('path cycle select', function() {
    beforeEach(function() {
      this.$fixture.empty().append(
        '<select class="cycle-select" data-cycle-location="path">' +
          '<option value="2012"></option>' +
          '<option value="2014"></option>' +
          '<option value="2016"></option>' +
        '</select>'
      );
      this.cycleSelect = CycleSelect.build($('#fixtures select'));
    });

    it('changes the query string on change', function() {
      this.cycleSelect.$elm.val('2014').change();
      var url = URI(window.location.href);
      url.path('2014/');
      expect(CycleSelect.prototype.setUrl).to.have.been.calledWith(url.toString());
    });
  });
});
