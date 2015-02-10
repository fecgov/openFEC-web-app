var d3 = require('d3');

module.exports = {
  init: function() {
    console.log('sorry for being charty to the party');

    var barChart = chartSeries()
      .max(function(values) {
        return this.hasAttribute("data-max")
          ? coerce(this.getAttribute("data-max"))
          : d3.max(values);
      })
      .dimension(function() {
        return this.classList.contains("chart-series--horizontal")
          ? "width"
          : "height";
      });

    d3.selectAll(".chart-series")
      .call(barChart);
  }
};

function chartSeries() {
  var barData = dataAttributes(["key", "value"]),
      dimension = d3.functor("height"),
      max = d3.max;

  function chart(selection) {
    selection.each(function() {
      var node = this,
          bars = d3.select(this)
            .selectAll(".chart-series__bar")
            .datum(barData),
          data = bars.data(),
          values = data.map(function(d) {
            return d.value;
          }),
          domain = [0, max.call(this, values)],
          scale = d3.scale.linear()
            .domain(domain)
            .range([0, 100]);

      var dim = dimension.apply(node, arguments);
      bars.each(function(d) {
        d.size = scale(d.value);
        // console.log(d.value, "->", d.height);
      })
      .style(dim, function(d) {
        return d.size + "%";
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

  return chart;
}

function dataAttributes(keys) {
  return function(d) {
    d = d || {};
    var attr = this.getAttribute.bind(this);
    keys.forEach(function(key) {
      d[key] = coerce(attr("data-" + key));
    });
    return d;
  };
}

function coerce(val) {
  // if the string is empty, just return it
  if (!val) return val;

  // coerce boolean values
  switch (val) {
    case "true": return true;
    case "false": return false;
  }

  // attempt to coerce numbers
  var n = +val;
  return isNaN(n) ? val : n;
}
