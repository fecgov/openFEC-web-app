from flask import Flask
from flask.ext.testing import TestCase
from openfecwebapp.data_prep.candidates import CandidateSchema
from openfecwebapp.tests.mock_data import candidate

class TestDataMappings(TestCase):

    def create_app(self):
        app = Flask(__name__)
        app.config['TESTING'] = True

        @app.route('/candidates')
        def candidates():
            pass

        @app.route('/committee/<c_id>')
        def committee_page():
            pass

        return app

    def test_map_candidate_page_values(self):
        vals = CandidateSchema().dump(candidate['results'][0]).data

        self.assertEqual(vals['state'], 'TN')
        self.assertEqual(vals['name'], 'Person McPersonson')
        self.assertEqual('challenger', vals['incumbent_challenge_full'])
