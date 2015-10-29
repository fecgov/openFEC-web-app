'use strict'

var chai = require('chai');
var expect = chai.expect;

var $ = require('jquery');

require('../setup')();

var Filter = require('../../../static/js/modules/filters').Filter;

function getChecked($input) {
  return $input.filter(function(idx, elm) {
    return $(elm).is(':checked');
  }).map(function(idx, elm) {
    return $(elm).val();
  }).get();
}

describe('filter set', function() {
  before(function() {
    this.$fixture = $('<div id="fixtures"></div>');
    $('body').append(this.$fixture);
  });

  describe('text filters', function() {
    beforeEach(function() {
      this.$fixture.empty().append(
        '<div class="filter">' +
          '<div class="input--removable">' +
            '<input name="name" />' +
            '<button class="button button--remove"></button>' +
          '</div>' +
        '</div>'
      );
      this.filter = Filter.build(this.$fixture.find('.filter'));
    });

    it('locates dom elements', function() {
      expect(this.filter.$elm.is('#fixtures .filter')).to.be.true;
      expect(this.filter.$input.is('#fixtures input')).to.be.true;
      expect(this.filter.$remove.is('#fixtures .filter .button--remove')).to.be.true;
    });

    it('sets values', function() {
      this.filter.setValue('jed');
      expect(this.filter.$input.val()).to.equal('jed');
    });

    it('sets empty values', function() {
      this.filter.setValue();
      expect(this.filter.$input.val()).to.equal('');
    });

    it('shows remove button with value', function() {
      this.filter.$input.val('jed').change();
      expect(this.filter.$remove.is(':visible')).to.be.true;
    });

    it('hides remove button without value', function() {
      this.filter.$input.val('').change();
      expect(this.filter.$remove.is(':visible')).to.be.false;
    });

    it('clears input on remove click', function() {
      this.filter.$input.val('jed').change();
      this.filter.$remove.trigger('click');
      expect(this.filter.$input.val()).to.equal('');
      expect(this.filter.$remove.is(':visible')).to.be.false;
    });
  });

  describe('checkbox filters', function() {
    beforeEach(function() {
      this.$fixture.empty().append(
        '<div class="filter">' +
          '<div class="input--removable">' +
            '<input name="cycle" type="checkbox" value="2012" />' +
            '<input name="cycle" type="checkbox" value="2014" />' +
            '<input name="cycle" type="checkbox" value="2016" />' +
          '</div>' +
        '</div>'
      );
      this.filter = Filter.build(this.$fixture.find('.filter'));
    });

    it('sets scalar values', function() {
      this.filter.setValue('2012');
      expect(getChecked(this.filter.$input)).to.deep.equal(['2012']);
    });

    it('sets list values', function() {
      this.filter.setValue(['2012', '2016']);
      expect(getChecked(this.filter.$input)).to.deep.equal(['2012', '2016']);
    });

    it('sets empty values', function() {
      this.filter.setValue();
      expect(getChecked(this.filter.$input)).to.deep.equal([]);
    });
  });

  describe('date range filters', function() {
    beforeEach(function() {
      this.$fixture.empty().append(
        '<div class="filter date-choice-field">' +
          '<div class="input--removable">' +
            '<input name="date" type="radio" data-min-date="2015-01-01" data-max-date="2015-12-31">' +
            '<input name="date" type="radio" data-min-date="2016-01-01" data-max-date="2016-12-31">' +
            '<input name="min_date" class="js-min-date" />' +
            '<input name="max_date" class="js-max-date" />' +
          '</div>' +
        '</div>'
      );
      this.filter = Filter.build(this.$fixture.find('.filter'));
    });

    it('pulls values from query', function() {
      this.filter.fromQuery({
        min_date: '2015-01-01',
        max_date: '2015-12-31'
      });
      expect(this.filter.$elm.find('[name="min_date"]').val()).to.equal('2015-01-01');
      expect(this.filter.$elm.find('[name="max_date"]').val()).to.equal('2015-12-31');
    });
  });
});
