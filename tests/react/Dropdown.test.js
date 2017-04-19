const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const Dropdown = require('../../static/js/legal/filters/Dropdown');

it('renders dropdown', () => {
  const requestorOptions = [{value: 'opt1', text: 'Option 1'}, {value: 'opt2', text: 'Option 2'}];
  const component = rendered.create(
    <Dropdown key="ao_requestor_type" name="ao_requestor_type" label="Requestor Type"
    value="opt1" options={requestorOptions} handleChange={() => {}} />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
