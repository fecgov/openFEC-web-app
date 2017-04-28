const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const CheckboxFilter = require('../../static/js/legal/filters/CheckboxFilter');

it('renders checkbox', () => {
  const component = rendered.create(
    <CheckboxFilter key="ao_is_pending" name="ao_is_pending" label="Show only pending requests"
      checked={() => {}} handleChange={() => {}} />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
