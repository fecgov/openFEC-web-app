'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var MockDate = require('mockdate');
var expect = chai.expect;
chai.use(sinonChai);

var $ = require('jquery');
var moment = require('moment');

require('../setup')();

var download = require('../../../static/js/modules/download');

function clearStorage() {
  Object.keys(window.localStorage).forEach(function(key) {
    window.localStorage.removeItem(key);
  });
}

describe('helpers', function() {
  afterEach(clearStorage);

  describe('download', function() {
    it('adds a pending download', function() {
      var item = download.download('/1');
      expect(item.$body).not.to.be.null;
    });

    it('respects MAX_DOWNLOADS', function() {
      for (var i=0; i<5; i++) {
        download.download('/' + i.toString());
      }
      var item = download.download('/5');
      expect(item).to.be.undefined;
    });

    it('is idempotent', function() {
      var item1 = download.download('/1');
      var item2 = download.download('/1');
      expect(item1.$body).not.to.be.null;
      expect(item2.$body).to.be.null;
    });
  });

  describe('hydrate', function() {
    it('restores downloads from localStorage', function() {
      window.localStorage.setItem(
        'download-/1',
        JSON.stringify({
          timestamp: '2015-10-01',
          downloadUrl: '/download/1'
        })
      );
      var items = download.hydrate();
      expect(items.length).to.equal(1);
      expect(items[0].$body).not.to.be.null;
    });
  });
});

describe('DownloadItem', function() {
  describe('constructor()', function() {
    beforeEach(function() {
      MockDate.set(moment('1985-10-01'));
    });

    afterEach(function() {
      MockDate.reset();
    });

    beforeEach(function() {
      this.container = download.DownloadContainer.getInstance(document.body);
      this.item = new download.DownloadItem('/v1/1/', this.container);
    });

    afterEach(function() {
      this.item.close();
    });

    it('finds dom nodes', function() {
      expect(this.item.$body).to.be.null;
      expect(this.item.$parent).to.equal(this.container.$list);
    });

    it('parses url parts', function() {
      expect(this.item.apiUrl).to.equal('/v1/download/1/');
      expect(this.item.resource).to.equal('1');
    });

    it('sets null values from payload', function() {
      expect(this.item.isPending).to.be.false;
      expect(this.item.timestamp.slice(0, 10)).to.equal('1985-10-01');
      expect(this.item.downloadUrl).not.to.be.ok;
    });

    it('parses localStorage', function() {
      var downloadUrl = '/download';
      window.localStorage.setItem(
        this.item.key,
        JSON.stringify({
          timestamp: '2015-10-01',
          downloadUrl: downloadUrl
        })
      );
      var item = new download.DownloadItem('/v1/1/', this.container);
      expect(item.isPending).to.be.true;
      expect(item.timestamp).to.equal('2015-10-01');
      expect(item.downloadUrl).to.equal(downloadUrl);
    });
  });

});
