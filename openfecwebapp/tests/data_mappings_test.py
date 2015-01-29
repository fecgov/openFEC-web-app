import unittest
from flask import Flask
from flask.ext.testing import TestCase
from openfecwebapp.data_mappings import *

class TestDataMappings(TestCase):

    def create_app(self):
        app = Flask(__name__)
        app.config['TESTING'] = True

        @app.route('/candidates')
        def candidates():
            pass

        return app

    def setUp(self):
        self.candidate = {
            'name': {
                'full_name': 'Person McPersonson'
            },
            'elections': [{
                'party_affiliation': 'Cool People',
                'state': 'TN',
                'election_year': '2012',
                'office_sought_full': 'Supreme Ruler',
                'district': '11'
            }],
            'candidate_id': 'A12345',
            'pagination': {
                'per_page': '20',
                'page': '2',
                'pages': '5',
                'count': '100'
            }
        }


    def test_map_candidate_table_values(self):
        vals = map_candidate_table_values(self.candidate)

        self.assertEqual('Person McPersonson', vals['name'])
        self.assertEqual('Supreme Ruler', vals['office'])
        self.assertEqual(2012, vals['election'])
        self.assertEqual('TN', vals['state'])
        self.assertEqual(11, vals['district'])
        self.assertEqual('A12345', vals['id'])
        self.assertEqual('/candidates/A12345', vals['nameURL'])

    def test_generate_pagination_values(self):
        params = {}
        url = 'http://yay.com'
        data_type = 'candidates'

        with self.app.app_context():
            vals = generate_pagination_values(self.candidate, params,
                url, data_type)

        self.assertEqual('100', vals['results_count'])
        self.assertEqual(2, vals['page'])
        self.assertEqual(20, vals['per_page'])
        self.assertEqual(21, vals['current_results_start'])
        self.assertEqual(40, vals['current_results_end'])
        self.assertEqual(True, vals['results_range'])
        self.assertEqual(True, vals['pagination_links'])


if __name__ == '__main__':
    unittest.main()
