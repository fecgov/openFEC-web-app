'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

var $ = require('jquery');

require('../setup')();

var FilterPanel = require('../../../static/js/modules/filter-panel').FilterPanel;
var FilterSet = require('../../../static/js/modules/filter-set').FilterSet;

function expectOpen(panel) {
  expect(panel.isOpen).to.be.true;
  expect(panel.$body.hasClass('is-open')).to.be.true;
  expect(panel.$toggle.hasClass('is-active')).to.be.true;
  expect($('body').hasClass('is-showing-filters')).to.be.true;
  expect(panel.$toggle.find('.filters__toggle__text').html()).to.equal('Hide filters');
}

function expectClosed(panel) {
  expect(panel.isOpen).to.be.false;
  expect(panel.$body.hasClass('is-open')).to.be.false;
  expect(panel.$toggle.hasClass('is-active')).to.be.false;
  expect($('body').hasClass('is-showing-filters')).to.be.false;
  expect(panel.$toggle.find('.filters__toggle__text').html()).to.equal('Show filters');
}

describe('filter panel', function() {
  before(function() {
    this.$fixture = $('<div id="fixtures"></div>');
    $('body').append(this.$fixture);
  });

  beforeEach(function() {
    this.$fixture.empty().append(
      '<div id="filter-toggle">' +
        '<div class="filters__toggle__text"></div>' +
      '</div>' +
      '<div id="filters" class="filters">' +
        '<form id="category-filters">' +
        '</form>' +
      '</div>'
    );
    this.panel = new FilterPanel();
  });

  it('should start off closed', function() {
    expectClosed(this.panel);
  });

  it('should toggle on click', function() {
    this.panel.$toggle.trigger('click');
    expectOpen(this.panel);
    this.panel.$toggle.trigger('click');
    expectClosed(this.panel);
  });

  it('should start off open on wide windows', function() {
    $('body').width(769);
    var panel = new FilterPanel();
    expectOpen(panel);
  });

  describe('interaction with filterset', function() {
    beforeEach(function() {
      sinon.stub(FilterSet.prototype, 'serialize').returns({name: 'jed'});
    });

    afterEach(function() {
      FilterSet.prototype.serialize.restore();
    });

    it('should start off open when contained filterset has values', function() {
      var panel = new FilterPanel();
      expectOpen(panel);
    });
  });
});
