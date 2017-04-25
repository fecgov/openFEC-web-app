const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const FilterPanel = require('../../static/js/legal/FilterPanel');

it('renders filter panel', () => {
  const component = rendered.create(
    <FilterPanel id="first-content-0" header="Documents" startOpen={true}>tests</FilterPanel>);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
