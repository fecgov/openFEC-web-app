/* Accessible tab interface
/* Courtesy of http://heydonworks.com/practical_aria_examples/
-----------------------------------------------------------------------------------------
*/

var URI = require('URIjs');
var _ = require('underscore');

var events = require('../modules/events');

// The class for the container div

var $container = '.tab-interface';

// Change focus between tabs with arrow keys

$('[role="tab"]').on('keydown', function(e) {

  // define current, previous and next (possible) tabs

  var $original = $(this);
  var $prev = $(this).parents('li').prev().children('[role="tab"]');
  var $next = $(this).parents('li').next().children('[role="tab"]');
  var $target;

  // find the direction (prev or next)

  switch (e.keyCode) {
    case 37:
      $target = $prev;
      break;
    case 39:
      $target = $next;
      break;
    default:
      $target = false;
      break;
  }

  if ($target && $target.length) {
    show($target, true);
    $target.focus();
  }
});

// Handle click on tab to show + focus tabpanel

$('[role="tab"]').on('click', function(e) {
  e.preventDefault();
  show($(this), true);
});

function show($target, push) {
  // Toggle tabs
  $('[role="tab"]').attr({
    'tabindex': '-1',
    'aria-selected': null
  });
  $target.attr({
    'aria-selected': 'true',
    'tabindex': '0'
  });

  // Toggle panels
  $($container + ' [role="tabpanel"]').attr('aria-hidden', 'true');
  var $panel = $('#' + $target.attr('href').substring(1));
  $panel.attr('aria-hidden', null);

  var name = $target.closest('[role="tablist"]').attr('data-name');
  var value = $target.attr('data-name');

  if (push) {
    var query = _.extend(
      URI.parseQuery(window.location.search),
      _.object([[name, value]])
    );
    var search = URI('').query(query).toString();
    window.history.pushState(query, search, search || window.location.pathname);
  }

  events.emit('tabs.show.' + value, {$tab: $target, $panel: $panel});
}

function refreshTabs() {
  var query = URI.parseQuery(window.location.search);
  $('ul[role="tablist"]').each(function(index, tabs) {
    var $tabs = $(tabs);
    var name = $tabs.attr('data-name');
    var $target = query[name] ?
      $tabs.find('[role="tab"][data-name="' + query[name] + '"]') :
      $tabs.find('[role="tab"]').eq(0);
    show($target);
  });
}

$(window).on('popstate', refreshTabs);
refreshTabs();

function onShow($elm, callback) {
  var $panel = $elm.closest('[role="tabpanel"]');
  if ($panel.is(':visible')) {
    callback();
  } else {
    var $trigger = $('[href="#' + $panel.attr('id') + '"]');
    var event = 'tabs.show.' + $trigger.attr('data-name');
    events.once(event, callback);
  }
}

module.exports = {
  onShow: onShow
};
