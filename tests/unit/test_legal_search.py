import unittest
from unittest import mock
from urllib.parse import urlparse, parse_qs
import codecs
import json
from collections import OrderedDict


from openfecwebapp import api_caller
from openfecwebapp.app import app
from tests import factory

class TestLegalSearch(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_no_query(self, load_legal_search_results):
        response = self.app.get('/legal/search/')
        assert response.status_code == 200
        load_legal_search_results.assert_not_called()

    def test_search_type_regulations_redirects(self):
        response = self.app.get('/legal/search/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'regulations'})
        assert response.status_code == 302

        url = urlparse(response.location)
        query = parse_qs(url.query)
        assert url.path == '/legal/search/regulations/'
        assert 'search' in query
        assert 'search_type' in query
        assert query['search'] == ['in kind donation']
        assert query['search_type'] == ['regulations']

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_universal(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.legal_universal_search_results()
        response = self.app.get('/legal/search/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'all'})

        assert response.status_code == 200
        load_legal_search_results.assert_called_once_with('in kind donation', 'all', limit=3)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_regulations(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.regulations_search_results()
        response = self.app.get('/legal/search/regulations/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'regulations'})

        assert response.status_code == 200
        load_legal_search_results.assert_called_once_with('in kind donation',
            'regulations', None, None, None, None, None, None, None, None, None, offset=0)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_advisory_opinions(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.advisory_opinions_search_results()
        response = self.app.get('/legal/search/advisory-opinions/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'advisory_opinions'})
        assert response.status_code == 200

        load_legal_search_results.assert_called_once_with('in kind donation',
            'advisory_opinions', None, None, None, None, None, None, 0, None, None, offset=0)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_pagination(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.regulations_search_results()
        response = self.app.get('/legal/search/regulations/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'regulations',
                    'offset': 20})
        assert response.status_code == 200
        load_legal_search_results.assert_called_once_with('in kind donation',
         'regulations', None, None, None, None, None, None, None, None, None, offset=20)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_statutes(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.statutes_search_results()
        response = self.app.get('/legal/search/statutes/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'statutes'})
        assert response.status_code == 200
        load_legal_search_results.assert_called_once_with('in kind donation', 'statutes',
            None, None, None, None, None, None, None, None, None, offset=0)

    @mock.patch.object(api_caller, '_call_api')
    def test_advisory_opinion_grouping(self, _call_api_mock):
        _call_api_mock.return_value = {'advisory_opinions':
                [{'no': 1, 'date': '2016'}, {'no': 1, 'date': '2015'},
                 {'no': 2, 'date': '1999'}]}
        results = api_caller.load_legal_search_results(query='president')
        assert results == {'advisory_opinions': OrderedDict([(1,
            [{'no': 1, 'date': '2016'}, {'no': 1, 'date': '2015'}]),
            (2, [{'no': 2, 'date': '1999'}])]),
            'limit': 20, 'offset': 0, 'advisory_opinions_returned': 3}

    @mock.patch.object(api_caller, '_call_api')
    def test_result_counts(self, _call_api_mock):
        _call_api_mock.return_value = {'advisory_opinions':
            [{'no': 1, 'date': '2016'}, {'no': 1, 'date': '2015'},
            {'no': 2, 'date': '1999'}], 'statutes': [{}] * 4,
            'regulations': [{}] * 5}
        results = api_caller.load_legal_search_results(query='president')

        assert len(results['advisory_opinions']) == 2
        assert results['advisory_opinions_returned'] == 3
        assert results['statutes_returned'] == 4
        assert results['regulations_returned'] == 5

if __name__ == '__main__':
    unittest.main()
