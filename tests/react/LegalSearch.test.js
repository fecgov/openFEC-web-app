const shallow = require('enzyme').shallow;
const React = require('react');
const LegalSearch = require('../../static/js/legal/LegalSearch');

it('shallow renders legal search', () => {
  const component = shallow(<LegalSearch />);
  expect(component).toBeTruthy();
});

it('can set query', () => {
  const component = shallow(<LegalSearch />);
  const e = {target: {name: 'inputA', value: 'foo'} };
  component.instance().setQuery(e);
  component.update();
  expect(component.instance().state.inputA).toBe('foo');
});

it('can set checkbox query', () => {
  const component = shallow(<LegalSearch />);
  const e = {target: {name: 'inputA', checked: 'true', type: 'checkbox'} };
  component.instance().setQuery(e);
  component.update();
  expect(component.instance().state.inputA).toBe('true');
});

it('can instant query', () => {
  const component = shallow(<LegalSearch />);
  const e = {target: {name: 'inputA', value: 'foo'} };
  const getResultsMock = jest.fn();
  component.instance().getResults = getResultsMock;
  component.instance().instantQuery(e);
  component.update();
  expect(component.instance().state.inputA).toBe('foo');
  expect(getResultsMock.mock.calls.length).toBe(1);
});

it('can instant query with checkbox', () => {
  const component = shallow(<LegalSearch />);
  const e = {target: {name: 'inputA', checked: 'true', type: 'checkbox'} };
  const getResultsMock = jest.fn();
  component.instance().getResults = getResultsMock;
  component.instance().instantQuery(e);
  component.update();
  expect(component.instance().state.inputA).toBe('true');
  expect(getResultsMock.mock.calls.length).toBe(1);
});

it('can get results', () => {
  const component = shallow(<LegalSearch />);
  const $ = require('jquery');
  $.getJSON.mockClear();
  component.instance().setState({q: 'president', type: 'advisory_opinion'})
  component.update();
  component.instance().getResults();
  component.update();
  expect($.getJSON.mock.calls.length).toBe(1);
});

it('filters non-query data from state', () => {
  const component = shallow(<LegalSearch />);
  const $ = require('jquery');
  $.getJSON.mockClear();
  component.instance().setState({doc_no: '1999-01', doc_name: 'test doc', type: 'advisory_opinion',
  'advisory_opinions': [],  'resultCount': 2, 'lastResultCount': 5, 'lastFilter': 'q'})
  component.update();
  component.instance().getResults();
  component.update();
  expect($.getJSON.mock.calls.length).toBe(1);
  expect($.getJSON.mock.calls[0][0])
    .toBe('https://fake.fec.api/v1/legal/search?' +
      'api_key=123&type=advisory_opinions&type=advisory_opinion' +
      '&doc_no=1999-01&doc_name=test+doc');
});
