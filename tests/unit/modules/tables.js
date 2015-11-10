'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var $ = require('jquery');

require('../setup')();

var DataTable = require('../../../static/js/modules/tables').DataTable;

describe('data table', function() {
  before(function() {
    this.$fixture = $('<div id="fixtures"></div>');
    $('body').append(this.$fixture);
  });

  beforeEach(function() {
    this.$fixture.empty().append(
      '<table id="table">' +
        '<thead>' +
          '<tr>' +
            '<th>Name</th>' +
            '<th>Office</th>' +
            '<th>Party</th>' +
          '</tr>' +
        '</thead>' +
      '</table>'
    );
    this.deferred = $.Deferred();
    sinon.stub($, 'ajax').returns(this.deferred);
    this.table = new DataTable('table', {
      columns: [
        {data: 'name'},
        {data: 'office'},
        {data: 'party'},
      ]
    });
  });

  afterEach(function() {
    $.ajax.restore();
    this.table.destroy();
  });

  describe('constructor()', function() {
    it('locates dom elements', function() {
      expect(this.table.$body.is('#table')).to.be.true;
    });

    it('adds self to registry', function() {
      expect(DataTable.registry.table).to.equal(this.table);
    });

    it('adds hidden loading widget', function() {
      var prev = this.table.$body.prev('.is-loading');
      expect(prev.length).to.equal(1);
      expect(prev.is(':visible')).to.be.false;
    });
  });
});
