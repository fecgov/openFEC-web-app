'use strict';

/* global module, ga */

var $ = require('jquery');
var helpers = require('./helpers');

function ReactionBox(selector) {
  this.$element = $(selector);
  this.$form = this.$element.find('form');
  this.$fieldset = this.$element.find('fieldset');
  this.$textarea = this.$element.find('textarea');

  this.$step1 = this.$element.find('.js-reaction-step-1');
  this.$step2 = this.$element.find('.js-reaction-step-2');
  this.$success = this.$element.find('.js-reaction-success');
  this.$error = this.$element.find('.js-reaction-error');

  this.name = this.$element.data('name');
  this.location = this.$element.data('location');

  this.url = helpers.buildAppUrl(['issue']);

  this.$fieldset.on('change', this.handleChange.bind(this));
  this.$element.on('click', '.js-skip', this.handleSuccess.bind(this));
  this.$element.on('click', '.js-reset', this.handleReset.bind(this));

  this.$form.on('submit', this.handleSubmit.bind(this));
}

ReactionBox.prototype.handleChange = function(e) {
  var $target = $(e.target);
  this.reaction = $target.val();

  if (typeof ga !== 'undefined') {
    var gaEventData = {
      hitType: 'event',
      eventCategory: 'Reactions',
      eventAction: this.location + '-' + this.name + ': ' + this.reaction,
      eventValue: 1
    };
    ga('send', gaEventData);
  }

  this.showTextarea();
};

ReactionBox.prototype.showTextarea = function() {
  this.$step1.attr('aria-hidden', true);
  this.$step2.attr('aria-hidden', false);

  var labelMap = {
    'informative': 'Great! \n What did you learn?',
    'confusing': 'We\'re sorry to hear that. What didn\'t make sense?',
    'not-interested': 'We\'re sorry to hear that. What would you like to see?',
    'none': 'How we can make this better?'
  };

  this.$step2.find('label').text(labelMap[this.reaction]);
};

ReactionBox.prototype.handleSubmit = function(e) {
  e.preventDefault();
  var data = {
    action: 'Looking at the ' + '"' + this.name + '" chart on the ' +
      this.location + ' page',
    feedback: 'How was it? ' + this.reaction + '\n' +
      'Tell us more: ' + this.$textarea.val(),
  };
  var promise = $.ajax({
    method: 'POST',
    url: this.url,
    data: JSON.stringify(data),
    contentType: 'application/json'
  });

  promise.done(this.handleSuccess.bind(this));
  promise.fail(this.handleError.bind(this));
};

ReactionBox.prototype.handleSuccess = function() {
  this.$step2.attr('aria-hidden', true);
  this.$success.attr('aria-hidden', false);
};

ReactionBox.prototype.handleError = function() {
  this.$step2.attr('aria-hidden', true);
  this.$error.attr('aria-hidden', false);
};

ReactionBox.prototype.handleReset = function() {
  this.$error.attr('aria-hidden', true);
  this.$step2.attr('aria-hidden', false);
  this.$textarea.val('');
};

module.exports = { ReactionBox: ReactionBox };

