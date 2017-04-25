const jquery = function(arg) { return {val: () => arg } };

jquery.getJSON = jest.fn();

module.exports = jquery;
