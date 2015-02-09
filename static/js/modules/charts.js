var d3 = require('d3');

module.exports = {
  init: function() {
    console.log('sorry for being charty to the party');

    d3.selectAll(".chart-series")
      .call(chartSeries());
  }
};

function chartSeries() {
  var barHeight = [0, 200];

  function chart(selection) {
    var bars = selection
          .selectAll(".chart-series__group__bar")
          .datum(dataAttributes("key", "value")),
        data = bars.data(),
        values = data.map(function(d) {
          return d.value;
        }),
        domain = d3.extent(values),
        scale = d3.scale.linear()
          .domain(domain)
          .rangeRound(barHeight);

    bars.each(function(d) {
      d.height = scale(d.value);
      // console.log(d.value, "->", d.height);
    })
    .style("height", function(d) {
      return d.height + "px";
    });
  }

  return chart;
}

function dataAttributes() {
  var keys = Array.prototype.slice.call(arguments);
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
  if (!val) return val;
  var n = +val;
  return isNaN(n) ? val : n;
}
