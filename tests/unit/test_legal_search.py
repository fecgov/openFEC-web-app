import unittest
from unittest import mock
from urllib.parse import urlparse, parse_qs

import flask

from openfecwebapp import api_caller
from openfecwebapp.app import app
from tests import factory


class TestLegalSearch(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_no_query(self, load_legal_search_results):
        response = self.app.get('/legal/search/')
        self.assertEqual(response.status_code, 200)
        load_legal_search_results.assert_not_called()

    def test_search_type_regulations_redirects(self):
        response = self.app.get('/legal/search/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'regulations'})
        self.assertEqual(response.status_code, 302)

        url = urlparse(response.location)
        query = parse_qs(url.query)
        self.assertEqual(url.path, '/legal/search/regulations/')
        self.assertIn('search', query)
        self.assertIn('search_type', query)
        self.assertEqual(query['search'], ['in kind donation'])
        self.assertEqual(query['search_type'], ['regulations'])

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_universal(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.legal_universal_search_results()
        response = self.app.get('/legal/search/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'all'})

        self.assertEqual(response.status_code, 200)
        load_legal_search_results.assert_called_once_with('in kind donation', 'all', limit=3)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_regulations(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.regulations_search_results()
        response = self.app.get('/legal/search/regulations/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'regulations'})

        self.assertEqual(response.status_code, 200)
        load_legal_search_results.assert_called_once_with('in kind donation', 'regulations', offset=0)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_advisory_opinions(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.advisory_opinions_search_results()
        response = self.app.get('/legal/search/advisory-opinions/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'advisory_opinions'})
        self.assertEqual(response.status_code, 200)
        load_legal_search_results.assert_called_once_with('in kind donation', 'advisory_opinions', offset=0)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_pagination(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.regulations_search_results()
        response = self.app.get('/legal/search/regulations/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'regulations',
                    'offset': 20})
        self.assertEqual(response.status_code, 200)
        load_legal_search_results.assert_called_once_with('in kind donation', 'regulations', offset=20)

    @mock.patch.object(api_caller, 'load_legal_search_results')
    def test_search_statutes(self, load_legal_search_results):
        load_legal_search_results.return_value = factory.statutes_search_results()
        response = self.app.get('/legal/search/statutes/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'statutes'})
        self.assertEqual(response.status_code, 200)
        load_legal_search_results.assert_called_once_with('in kind donation', 'statutes', offset=0)


if __name__ == '__main__':
    unittest.main()
