from flask import Flask
from flask.ext.testing import TestCase
from openfecwebapp.models.shared import *
from openfecwebapp.tests.mock_data import candidate

class TestShared(TestCase):
    def create_app(self):
        app = Flask(__name__)
        app.config['TESTING'] = True

        @app.route('/candidates')
        def candidates():
            pass

        return app

    def test_generate_pagination_values(self):
        params = {}
        data_type = 'candidates'

        with self.app.app_context():
            vals = generate_pagination_values(candidate, params, 
                data_type)

        self.assertEqual('100', vals['results_count'])
        self.assertEqual(2, vals['page'])
        self.assertEqual(20, vals['per_page'])
        self.assertEqual(21, vals['current_results_start'])
        self.assertEqual(40, vals['current_results_end'])
        self.assertTrue(vals['results_range'])
        self.assertTrue(vals['pagination_links'])
        self.assertEqual('/candidates?page=3', vals['next_url'])
        self.assertEqual('/candidates?page=1', vals['prev_url'])

