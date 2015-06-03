var d3 = require('d3'),
    formatCommas = d3.format(','),
    formatCurrency = function(dollars) {
      return '$' + formatCommas(dollars);
    };

module.exports = {
  init: function() {
    // console.log('sorry for being charty to the party');

    var barChart = chartSeries()
          .max(function(values) {
            return this.hasAttribute('data-max')
              ? coerce(this.getAttribute('data-max'))
              : d3.max(values);
          })
          .dimension(function() {
            return this.classList.contains('chart-series--horizontal')
              ? 'width'
              : 'height';
          }),
        adjustTooltips = tooltipAdjuster()
          .selector('.chart-series__bar__tooltip');

    d3.selectAll('.js-chart-series')
      .call(barChart)
      .selectAll('.chart-series__bar')
        .call(adjustTooltips);
  }
};

function chartSeries() {
  var barData = dataAttributes(['key', 'value']),
      dimension = d3.functor('height'),
      max = d3.max;

  function chart(selection) {
    selection.each(function() {
      var node = d3.select(this),
          bars = node.selectAll('.chart-series__bar')
            .datum(barData),
          data = bars.data(),
          values = data.map(function(d) {
            return d.value;
          }),
          domain = [0, max.call(this, values)],
          scale = d3.scale.linear()
            .domain(domain)
            .range([0, 100]);

      var dim = dimension.apply(this, arguments);
      d3.select(this)
        .call(drawScale, scale, dim);

      bars.each(function(d) {
        if (d.value < 0) {
          d.size = 0;
        } else {
          d.size = scale(d.value);
        }
      })
      .style(dim, function(d) {
        return d.size + '%';
      });
    });
  }

  chart.dimension = function(dim) {
    if (!arguments.length) return dimension;
    dimension = d3.functor(dim);
    return chart;
  };

  chart.max = function(x) {
    if (!arguments.length) return max;
    max = d3.functor(x);
    return chart;
  };

  function drawScale(selection, scale, dimension) {
    var axis = selection.append('div')
          .attr('class', 'chart-series__axis'),
        property = dimension === 'width' ? 'right' : 'bottom';
    axis.selectAll('.tick')
      .data(scale.ticks(2))
      .enter()
      .append('div')
        .attr('class', 'chart-series__axis__tick')
        .style(property, function(d) { return scale(d) + '%' })
        .append('span')
          .attr('class', 'chart-series__axis__tick__text')
          .text(function(d) { return formatCurrency(d) });
  }

  return chart;
}

/**
 * The tooltip adjuster adds mouseover, focus and touchstart event
 * handlers to a selection and tweaks the positioning of its tooltip
 * children so that they're centered.
 *
 * @example
 *
 *    var adjuster = tooltipAdjuster()
 *      .selector('.chart-series__bar__tooltip');
 *    d3.selectAll('.chart-series__bar')
 *      .call(adjuster);
 *
 * @return {Function}
 */
function tooltipAdjuster() {
  var dir = d3.functor('n'),
      selector = '.tooltip',
      offset = function() {
        var display = this.style.display;
        this.style.display = 'initial';
        var rect = this.getBoundingClientRect(),
            _dir = dir.apply(this, arguments),
            size = (_dir === 'e' || _dir === 'w')
              ? rect.height
              : rect.width;
        // console.log(this, rect, _dir, size);
        this.style.display = display;
        return Math.round(-size / 2);
      };

  function adjustTooltip(selection) {
    selection
      .on('mouseover', adjust)
      .on('focus', adjust)
      .on('touchtart', adjust);
  }

  function adjust() {
    var tip = this.querySelector(selector);
    if (!tip) return;
    var off = offset.apply(tip, arguments);
    tip.style.setProperty('margin-left', off + 'px');
  }

  adjustTooltip.selector = function(x) {
    if (!arguments.length) return selector;
    selector = x;
    return adjustTooltip;
  };

  adjustTooltip.direction = function(x) {
    if (!arguments.length) return dir;
    dir = d3.functor(x);
    return adjustTooltip;
  };

  return adjustTooltip;
}

function dataAttributes(keys) {
  return function(d) {
    d = d || {};
    var attr = this.getAttribute.bind(this);
    keys.forEach(function(key) {
      d[key] = coerce(attr('data-' + key));
    });
    return d;
  };
}

function coerce(val) {
  // if the string is empty, just return it
  if (!val) return val;

  // coerce boolean values
  switch (val) {
    case 'true': return true;
    case 'false': return false;
  }

  // attempt to coerce numbers
  var n = +val;
  return isNaN(n) ? val : n;
}
