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

function trim(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ');
}

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

    it('renders static two-year period', function() {
      expect(trim(this.cycleSelect.$cycles.text())).to.equal('Time period: 2011–2012');
    });

    it('changes the query string on change', function() {
      this.cycleSelect.$elm.val('2014').change();
      expect(CycleSelect.prototype.setUrl).to.have.been.calledWith(window.location.href + '?cycle=2014');
    });
  });

  describe('election query cycle select', function() {
    beforeEach(function() {
      this.$fixture.empty().append(
        '<select class="cycle-select" data-duration="4" data-cycle-location="query">' +
          '<option value="2016"></option>' +
          '<option value="2012"></option>' +
          '<option value="2008"></option>' +
        '</select>'
      );
      this.cycleSelect = CycleSelect.build($('#fixtures select'));
    });

    it('renders two-year period select', function() {
      var $cycles = this.cycleSelect.$cycles.find('span');
      expect($cycles.length).to.equal(3);
      var labels = ['Full cycle: 2013–2016', '2015–2016', '2013–2014'];
      expect(
        $cycles.map(function(idx, elm) {
          return trim($(elm).text());
        }).get()
      ).to.deep.equal(labels);
    });

    it('changes the query string on change', function() {
      this.cycleSelect.$cycles.find('[name="cycle-toggle"]').val('2014').change();
      expect(
        CycleSelect.prototype.setUrl
      ).to.have.been.calledWith(
        window.location.href + '?cycle=2014&election_full=false'
      );
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
