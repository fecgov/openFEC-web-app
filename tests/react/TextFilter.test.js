const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const TextFilter = require('../../static/js/legal/filters/TextFilter');

it('renders dropdown', () => {
  const requestorOptions = [{value: 'opt1', text: 'Option 1'}, {value: 'opt2', text: 'Option 2'}];
  const component = rendered.create(
    <TextFilter key="ao_no" name="ao_no" label="AO number" value=""
        handleChange={() => {}} getResults={() => {}} />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
