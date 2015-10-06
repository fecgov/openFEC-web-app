'use strict';

/* global require, module, window */

var $ = require('jquery');

var helpers = require('./helpers');

function FeedbackWidget(selector) {
  this.$body = $(selector);
  this.$form = this.$body.find('form');
  this.$comment = this.$form.find('textarea');

  this.$form.on('submit', this.submit.bind(this));
}

FeedbackWidget.prototype.submit = function(e) {
  e.preventDefault();
  var promise = $.ajax({
    method: 'POST',
    url: helpers.buildAppUrl(['issue']),
    data: {
      url: window.location.href,
      comment: this.$comment.val()
    }
  });
};

module.exports = {FeedbackWidget: FeedbackWidget};
