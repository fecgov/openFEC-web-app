'use strict';

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');

var pending = require('../../templates/download/pending.hbs');
var complete = require('../../templates/download/complete.hbs');

var PREFIX = 'download-';
var MAX_DOWNLOADS = 5;

function hydrate() {
  storedDownloads().forEach(function(key) {
    download(key.slice(PREFIX.length), true);
  });
}

function download(url, init) {
  if (storedDownloads().length >= MAX_DOWNLOADS) { return; }
  var item = new DownloadItem(url);
  if (init || item.downloadUrl === null) {
    item.init();
  }
}

function storedDownloads() {
  return Object.keys(window.localStorage).filter(function(key) {
    return key.indexOf(PREFIX) === 0;
  });
}

function downloadUrl(url) {
  var uri = URI(url);
  var path = uri.path().split('/');
  path.splice(2, 0, 'download');
  uri.path(path.join('/'));
  return uri.toString();
}

var defaultOpts = {
  timeout: 5000,
  parent: '.js-downloads-list'
};

function DownloadItem(url, opts) {
  this.url = url;
  this.opts = _.extend({}, defaultOpts, opts);

  this.$body = null;
  this.$parent = $(this.opts.parent);

  this.timeout = null;
  this.promise = null;

  this.key = PREFIX + this.url;
  this.apiUrl = downloadUrl(this.url);
  this.downloadUrl = window.localStorage.getItem(this.key);
}

DownloadItem.prototype.init = function() {
  this.draw();
  if (!this.downloadUrl) {
    this.refresh();
    this.push();
  }
};

DownloadItem.prototype.draw = function() {
  var template = this.downloadUrl ? complete : pending;
  var $body = $(template(this.serialize()));
  if (this.$body) {
    this.$body.replaceWith($body);
  } else {
    $body.appendTo(this.$parent);
  }
  $body.find('.js-close').on('click', this.close.bind(this));
  this.$body = $body;
};

DownloadItem.prototype.serialize = function() {
  return {
    url: this.url,
    apiUrl: this.apiUrl,
    downloadUrl: this.downloadUrl
  };
};

DownloadItem.prototype.schedule = function() {
  this.timeout = window.setTimeout(this.refresh.bind(this), this.opts.timeout);
};

DownloadItem.prototype.push = function() {
  window.localStorage.setItem(this.key, '');
};

DownloadItem.prototype.refresh = function() {
  this.promise = $.getJSON(this.apiUrl);
  this.promise.then(this.handleSuccess.bind(this));
  this.promise.fail(this.handleError.bind(this));
};

DownloadItem.prototype.handleSuccess = function(response) {
  if (response && response.status === 'complete') {
    this.finish(response.url);
  } else {
    this.schedule();
  }
};

DownloadItem.prototype.handleError = function() {
  this.schedule();
};

DownloadItem.prototype.finish = function(downloadUrl) {
  this.downloadUrl = downloadUrl;
  window.localStorage.setItem(this.key, downloadUrl);
  this.draw();
};

DownloadItem.prototype.close = function() {
  this.timeout && clearTimeout(this.timeout);
  this.promise && this.promise.abort();
  window.localStorage.removeItem(this.key);
  this.$body.remove();
};

module.exports = {
  hydrate: hydrate,
  download: download
};
