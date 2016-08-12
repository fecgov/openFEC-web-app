import unittest
from urllib.parse import urlparse, parse_qs

import flask

from openfecwebapp.app import app


class TestLegalSearch(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    def test_no_query(self):
        response = self.app.get('/legal/search/')
        self.assertEqual(response.status_code, 200)

    def test_search_type_regulations_redirects(self):
        response = self.app.get('/legal/search/',
                data={
                    'search': 'in kind donation',
                    'search_type': 'regulations'})
        self.assertEqual(response.status_code, 302)

        url = urlparse(response.location)
        query = parse_qs(url.query)
        self.assertEqual(url.path, '/legal/regulations/')
        self.assertIn('search', query)
        self.assertIn('search_type', query)
        self.assertEqual(query['search'], ['in kind donation'])
        self.assertEqual(query['search_type'], ['regulations'])


if __name__ == '__main__':
    unittest.main()
