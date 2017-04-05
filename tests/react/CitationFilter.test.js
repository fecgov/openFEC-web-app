const rendered = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const CitationFilter = require('../../static/js/legal/filters/CitationFilter');

it('renders checkbox list', () => {
  const component = rendered.create(
    <CitationFilter handleChange={() => {}} getResults={() => {}}
        key="ao_regulatory_citation" name="ao_regulatory_citation" label="Regulatory citation"
        instantQuery={() => {}} citationType="regulation" value=""
        resultCountChange={0} lastFilter=""/>);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
