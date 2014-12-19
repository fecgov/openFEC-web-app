/* Accessible tab interface
/* Courtesy of http://heydonworks.com/practical_aria_examples/
-----------------------------------------------------------------------------------------
*/

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
      $target = false
      break;
  }

  if ($target.length) {
      $original.attr({
        'tabindex' : '-1',
        'aria-selected' : null
      });
      $target.attr({
        'tabindex' : '0',
        'aria-selected' : true
      }).focus();
  }

  // Hide panels

  $($container +' [role="tabpanel"]')
    .attr('aria-hidden', 'true');

  // Show panel which corresponds to target

  $('#' + $(document.activeElement).attr('href').substring(1))
    .attr('aria-hidden', null);

});

// Handle click on tab to show + focus tabpanel

$('[role="tab"]').on('click', function(e) {

  e.preventDefault();

  // remove focusability [sic] and aria-selected

  $('[role="tab"]').attr({
    'tabindex': '-1',
    'aria-selected' : null
    });

  // replace above on clicked tab

  $(this).attr({
    'aria-selected' : true,
    'tabindex' : '0'
  });

  // Hide panels

  $($container +' [role="tabpanel"]').attr('aria-hidden', 'true');

  // show corresponding panel

  $('#' + $(this).attr('href').substring(1))
    .attr('aria-hidden', null);

});
