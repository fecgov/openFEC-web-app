const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const SearchResults = require('../../static/js/legal/SearchResults');

it('renders search results', () => {
  const component = rendered.create(
    <SearchResults advisory_opinions={[]} q="" />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
