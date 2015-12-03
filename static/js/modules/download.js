'use strict';

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');

var container = require('../../templates/download/container.hbs');
var pending = require('../../templates/download/pending.hbs');
var complete = require('../../templates/download/complete.hbs');

var PREFIX = 'download-';
var MAX_DOWNLOADS = 5;

var downloadContainer = null;

function hydrate() {
  storedDownloads().forEach(function(key) {
    download(key.slice(PREFIX.length), true);
  });
}

function download(url, init) {
  if (storedDownloads().length >= MAX_DOWNLOADS) { return; }

  if (!downloadContainer) {
    downloadContainer = new DownloadContainer(document.body);
    downloadContainer.init();
  }

  var item = new DownloadItem(url, null, downloadContainer);
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

function DownloadItem(url, opts, container) {
  this.url = url;
  this.opts = _.extend({}, defaultOpts, opts);
  this.container = container;

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
    this.container.add();
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
    this.container.updateStatus('complete');
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
  this.container.subtract();
};


function DownloadContainer(parent) {
  this.$parent = $(parent);
  this.$statusMessage = $('.js-download-status-message');
  this.status = 'pending';
  this.items = 0;
};

DownloadContainer.prototype.init = function() {
  this.$body = $(container());
  this.$parent.append(this.$body);
};

DownloadContainer.prototype.add = function() {
  this.items++;
};

DownloadContainer.prototype.subtract = function() {
  this.items = this.items - 1;
  if (this.items === 0) {
    this.destroy();
  }
};

DownloadContainer.prototype.updateStatus = function(status) {
  this.status = status;
  if (this.status === 'complete') {
    this.$statusMessage.text('Your export is complete');
  } else {
    this.$statusMessage.text('Building your exports...');
  }
};

DownloadContainer.prototype.destroy = function() {
  this.$body.remove();
  downloadContainer = null;
};

module.exports = {
  hydrate: hydrate,
  download: download
};
