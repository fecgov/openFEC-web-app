'use strict';

var events = require('./events.js');

var accordion = {
  SLT_HEADER: '.js-accordion-header',
  SLT_ITEM: '.js-accordion-item',
  SLT_BUTTON: '.js-accordion_button',
  EV_ACTIVATE: 'accordion:activate',

  /**
   * Initalize the accordion from the it's container. Will use set selectors to find the actual
   * accordion elements.
   *
   * @param $base {jQuery} The container of the accordion.
   */
  init: function($base) {
    var self = this;
    this.$headers = this.findHeaders($base);
    this.$items = this.findItems($base);
    this.$buttons = this.findButtons($headers);

    this.$buttons.each(function() {
      $(this).on('click', self.itemClickHandler);
    });

    events.on(this.EV_ACTIVATE, function(props) {
      self.hideAll();
      self.show(props.header);
    });
  },
  findHeaders: function($base) {
    return $base.find(SLT_HEADER);
  },
  findButtons: function($headers) {
    return $headers.find(SLT_BUTTON);
  },
  findItems: function($base) {
    return $base.find(SLT_ITEM);
  },
  findHeaderFromButton: function(target) {
    var $target = $(target);
    return $target.parent(SLT_HEADER);
  },
  findItemsFromHeader: function($header) {
    return $header.children(this.SLT_ITEM);
  },
  itemClickHandler: function(ev) {
    ev.preventDefault();
    var header = this.findHeaderFromButton(ev.target);
    events.emit(this.EV_ACTIVATE, {
      header: $(ev.currentTarget)
    });
  },
  hide: function($el) {
    $el.attr('aria-hidden', true);
    $el[0].style.display = 'none';
  },
  show: function($el) {
    $el.attr('aria-hidden', false);
    $el[0].style.display = 'block';
  },
  hideAll: function() {
    var self = this;
    this.$items.each(function() {
      self.hide($(this));
    });
  },
  showHeader: function($header) {
    var $items = this.findItemsFromHeader($header),
        self = this;
    $items.each(function() {
      self.show($(this));
    });
  }
};