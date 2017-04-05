const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const CitationRequireAllRadio = require('../../static/js/legal/filters/CitationRequireAllRadio');

it('renders checkbox list', () => {
  const component = rendered.create(
    <CitationRequireAllRadio key="ao_citation_require_all" name="ao_citation_require_all" 
    handleChange={() => {}} value="" />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
