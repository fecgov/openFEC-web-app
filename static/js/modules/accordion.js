'use strict';

var $ = require('jquery');

var events = require('./events.js');

var defaultOpts = {
  closeAll: false
};

var accordion = {
  SLT_HEADER: '.js-accordion_header',
  SLT_ITEM: '.js-accordion_item',
  SLT_BUTTON: '.js-accordion_button',
  CLS_COLLAPSED: 'accordion--collapsed',
  EV_EXPAND: 'accordion:expand',
  EV_COLLAPSE: 'accordion:collapse',

  /**
   * Initalize the accordion from the it's container. Will use set selectors to find the actual
   * accordion elements.
   *
   * Events
   *   accordion:active
   *   @param header {jQuery} The accordion header that is activated to be expanded.
   *   @param opts {Object} A hash of options to use.
   *
   * @param $base {jQuery} The container of the accordion.
   */
  init: function($base, opts) {
    var self = this;
    this.options = $.extend({}, defaultOpts, opts);
    this.$headers = this.findHeaders($base);
    this.$items = this.findItems($base);
    this.$buttons = this.findButtons(this.$headers);

    this.hideAll();

    this.$buttons.on('click', $.proxy(self.itemClickHandler, this));

    events.on(this.EV_EXPAND, function(props) {
      var $header = $(props.header);
      if (self.options.closeAll) {
        self.hideAll();
      }
      if ($.inArray($header, self.$headers)) {
        self.showHeader($header);
      }
    });
    events.on(this.EV_COLLAPSE, function(props) {
      var $header = $(props.header);
      if ($.inArray($header, self.$headers)) {
        if (self.options.closeAll) {
          self.hideAll();
        } else {
          self.hideHeader($header);
        }
      }
    });
  },
  findHeaders: function($base) {
    return $base.find(this.SLT_HEADER);
  },
  findButtons: function($headers) {
    return $headers.find(this.SLT_BUTTON);
  },
  findItems: function($base) {
    return $base.find(this.SLT_ITEM);
  },
  findHeaderFromButton: function($target) {
    return $target.parents(this.SLT_HEADER);
  },
  findItemsFromHeader: function($header) {
    return $header.siblings(this.SLT_ITEM);
  },
  itemClickHandler: function(ev) {
    ev.preventDefault();
    var $header = this.findHeaderFromButton($(ev.target)),
        eventCode;

    if ($header.hasClass(this.CLS_COLLAPSED)) {
      eventCode = this.EV_EXPAND;
    } else {
      eventCode = this.EV_COLLAPSE;
    }

    events.emit(eventCode, {
      header: $header
    });
  },
  /**
   * Hides an element visually.
   * Side-effects: sets attributes on DOM objects, changing their visual rendering.
   * @param $el {jQuery} A jQuery DOM object to hide.
   */
  hide: function($el) {
    $el.attr('aria-hidden', true);
    $el[0].style.display = 'none';
  },
  /**
   * Show an element visually.
   * Side-effects: sets attributes on DOM objects, changing their visual rendering.
   * @param $el {jQuery} A jQuery DOM object to show.
   * Note: Currently will automatically set elements to display block.
   */
  show: function($el) {
    $el.attr('aria-hidden', false);
    $el[0].style.display = 'block';
  },
  /**
   * Hide all items for the current accordion.
   * Side-effects: sets attributes on DOM objects, changing their visual rendering.
   */
  hideAll: function() {
    var self = this;
    this.$items.each(function() {
      self.hide($(this));
    });
    this.$headers.toggleClass(this.CLS_COLLAPSED, true);
  },

  /**
   * Hide all items under the accordion header passed in.
   * @param $header {jQuery} The header to hide items under.
   */
  hideHeader: function($header) {
    var $items = this.findItemsFromHeader($header),
        self = this;
    $items.each(function() {
      self.hide($(this));
    });
    $header.toggleClass(this.CLS_COLLAPSED, true);
  },

  /**
   * Show all items under the accordion header passed in.
   * @param $header {jQuery} The header to show items under.
   */
  showHeader: function($header) {
    var $items = this.findItemsFromHeader($header),
        self = this;
    $items.each(function() {
      self.show($(this));
    });
    $header.toggleClass(this.CLS_COLLAPSED, false);
  }
};

module.exports = accordion;
