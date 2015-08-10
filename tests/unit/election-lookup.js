'use strict'

/* global require, window, describe, before, beforeEach, after, afterEach, it */

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var $ = require('jquery');
var _ = require('underscore');

var ElectionLookup = require('../../static/js/pages/election-lookup').ElectionLookup;

_.extend(window, {
  API_LOCATION: '',
  API_VERSION: '/v1',
});

describe('election lookup', function() {
  before(function() {
    this.$fixture = $('<div id="fixtures"></div>');
    $('body').append(this.$fixture);
  });

  beforeEach(function() {
    this.$fixture.empty().append(
      '<div id="election-lookup">' +
        '<input name="zip" />' +
        '<input name="state" />' +
        '<input name="district" />' +
      '</div>'
    );
    this.el = new ElectionLookup('#election-lookup');
  });

  it('should memorize its selector', function() {
    expect(this.el.$elm.is($('#election-lookup'))).to.be.true;
  });

  it('should memorize its inputs', function() {
    expect(this.el.$zip.is($('#election-lookup [name="zip"]'))).to.be.true;
    expect(this.el.$state.is($('#election-lookup [name="state"]'))).to.be.true;
    expect(this.el.$district.is($('#election-lookup [name="district"]'))).to.be.true;
  });

  it('should serialize zip codes', function() {
    $('#election-lookup [name="zip"]').val('22902');
    expect(this.el.serialize()).to.deep.equal({cycle: 2016, zip: '22902'});
  });

  it('should serialize state and district inputs', function() {
    $('#election-lookup [name="state"]').val('VA');
    $('#election-lookup [name="district"]').val('01');
    expect(this.el.serialize()).to.deep.equal({cycle: 2016, state: 'VA', district: '01'});
  });

  describe('fetching ajax', function() {
    before(function() {
      this.response = {
        results: [
          {cycle: 2016, office: 'P', state: 'US'},
          {cycle: 2016, office: 'S', state: 'NJ'},
          {cycle: 2016, office: 'H', state: 'NJ', district: '09'}
        ]
      };
      this.deferred = $.Deferred();
      sinon.stub($, 'ajax').returns(this.deferred);
      this.deferred.resolve(this.response);
    });

    after(function() {
      $.ajax.restore();
    });

    it('should fetch and draw search results', function() {
      sinon.stub(this.el, 'draw');
      $('#election-lookup [name="zip"]').val('19041');
      this.el.search();
      expect($.ajax).to.have.been.called;
      var call = $.ajax.getCall(0);
      expect(call.args[0].url).to.equal('/v1/elections/search?cycle=2016&zip=19041');
      expect(this.el.draw).to.have.been.calledWith(this.response.results);
    });
  });
});
