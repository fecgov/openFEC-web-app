const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const Pagination = require('../../static/js/legal/Pagination');

it('renders pagination', () => {
  const component = rendered.create(
    <Pagination from_hit={0} advisory_opinions={[]}
      resultCount={0} handleChange={() => {}} />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
