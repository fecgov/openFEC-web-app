'use strict';

/* global module, ga */

var $ = require('jquery');

function ReactionBox(selector) {
  this.$element = $(selector);
  this.$form = $(selector).find('form');
  this.$fieldset = this.$form.find('fieldset');
  this.$textarea = this.$form.find('textarea');
  this.$radios = this.$form.find('ul');
  this.boxID = this.$element.data('box-id');
  this.$fieldset.on('change', this.handleChange.bind(this));
}

ReactionBox.prototype.handleChange = function(e) {
  var $target = $(e.target);

  if (typeof ga === 'undefined') { return; }
  var val = $target.val();
  var gaEventData = {
    hitType: 'event',
    eventCategory: 'Reactions: ' + this.boxID,
    eventAction: val
  };

  ga('send', gaEventData);

  this.showTextarea();
};

ReactionBox.prototype.showTextarea = function() {
  this.$radios.attr('aria-hidden', true);
  this.$textarea.attr('aria-hidden', false);
};

module.exports = { ReactionBox: ReactionBox };

