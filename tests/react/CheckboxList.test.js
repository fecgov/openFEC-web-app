const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const CheckboxList = require('../../static/js/legal/filters/CheckboxList');

it('renders checkbox list', () => {
  const documentTypes = [{text: 'Final Opinion', value: 'F'}, {text: 'Request', value: 'R'}];
  const component = rendered.create(
    <CheckboxList key="ao_category" name="ao_category" label="Document Type" value={['F']}
      handleChange={() => {}} options={documentTypes}/>);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
