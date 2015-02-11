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
                'district': '11',
                'incumbent_challenge_full': 'challenger',
                'primary_committee': {
                    'committee_id': 'D1234',
                    'committee_name': 'Friends of McPersonson',
                    'designation_full': 'Authorized',
                    'designation': 'PC' 
                },
                'affiliated_committees': [{
                    'committee_id': 'D1234',
                    'committee_name': 'Friends of McPersonson',
                    'designation_full': 'Authorized',
                    'designation': 'A' 
                }]
            }],
            'candidate_id': 'A12345',
            'pagination': {
                'per_page': '20',
                'page': '2',
                'pages': '5',
                'count': '100'
            }
        }

        self.committee = {
            'description': {
                'name': 'Friends of McPersonson',
                'organization_type_full': 'Secret Club'
            },
            'treasurer': {
                'name_full': 'Money McMaster'
            },
            'address': {
                'street_1': '123 Boulevard St.',
                'street_2': '#595',
                'city': 'Placetown',
                'state': 'KY',
                'zip': '23456'
            },
            'status': {
                'type_full': 'Partay',
                'designation_full': 'Very Authorized'
            },
            'committee_id': 'B7890'
        }

        self.totals = {
            'results': [{
                'reports': [
                {
                    'total_receipts_period': '23.32',
                    'total_disbursements_period': '1.24',
                    'cash_on_hand_end_period': 123.34,
                    'debts_owed_by_committee': 45678.90,
                    'report_year': 2010,
                    'election_cycle': 2010,
                    'report_type_full': 'End Report'
                },
                {
                    'total_receipts_period': '89.38',
                    'total_disbursements_period': '93.23',
                    'cash_on_hand_end_period': 452.32,
                    'debts_owed_by_committee': 82.32,
                    'report_year': 2012,
                    'election_cycle': 2012,
                    'report_type_full': 'Quarterly Report'
                }
                ],
                'totals': [{
                    'receipts': 231.45,
                    'disbursements': 3453.54
                }]
            }]
        }

    def test_map_candidate_page_values(self):
        vals = map_candidate_page_values(self.candidate)

        self.assertTrue(vals['related_committees'])
        self.assertEqual('challenger', vals['incumbent_challenge'])
        self.assertEqual('D1234', vals['primary_committee']['id'])
        self.assertEqual('Friends of McPersonson', 
            vals['primary_committee']['name'])
        self.assertEqual('Authorized',
            vals['primary_committee']['designation'])
        self.assertEqual('PC',
            vals['primary_committee']['designation_code'])
        self.assertEqual('/committees/D1234',
            vals['primary_committee']['name_url'])

        self.assertEqual('D1234', vals['authorized_committees'][0]['id'])
        self.assertEqual('Friends of McPersonson', 
            vals['authorized_committees'][0]['name'])
        self.assertEqual('Authorized',
            vals['authorized_committees'][0]['designation'])
        self.assertEqual('A',
            vals['authorized_committees'][0]['designation_code'])
        self.assertEqual('/committees/D1234',
            vals['authorized_committees'][0]['name_url'])

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
        self.assertTrue(vals['results_range'])
        self.assertTrue(vals['pagination_links'])
        self.assertEqual('/candidates?page=3', vals['next_url'])
        self.assertEqual('/candidates?page=1', vals['prev_url'])

    def test_map_committee_table_values(self):
        vals = map_committee_table_values(self.committee)

        self.assertEqual('Friends of McPersonson', vals['name'])
        self.assertEqual('Secret Club', vals['organization'])
        self.assertEqual('Money McMaster', vals['treasurer'])
        self.assertEqual('KY', vals['state'])
        self.assertEqual('Partay', vals['type'])
        self.assertEqual('Very Authorized', vals['designation'])        
        self.assertEqual('B7890', vals['id'])
        self.assertEqual('/committees/B7890', vals['name_url'])

    def test_map_totals(self):
        vals = map_totals(self.totals)

        self.assertEqual('$231.45', vals['total_receipts'])
        self.assertEqual('$3,453.54', vals['total_disbursements'])
        self.assertEqual('$123.34', vals['total_cash'])
        self.assertEqual('$45,678.90', vals['total_debt'])
        self.assertEqual('2010', vals['report_year'])
        self.assertEqual('2009 - 2010', vals['years_totals'])
        self.assertEqual('End Report', vals['report_desc'])

        self.assertEqual(123.34, vals['quarters'][0]['cash_on_hand'])
        self.assertEqual(45678.90, vals['quarters'][0]['debts_owed'])
        self.assertEqual('23.32', vals['quarters'][0]['receipts'])
        self.assertEqual('1.24', vals['quarters'][0]['disbursements'])
        self.assertEqual(452.32, vals['quarters'][1]['cash_on_hand'])
        self.assertEqual(82.32, vals['quarters'][1]['debts_owed'])
        self.assertEqual('89.38', vals['quarters'][1]['receipts'])
        self.assertEqual('93.23', vals['quarters'][1]['disbursements'])

    def test_map_committee_page_values(self):
        vals = map_committee_page_values(self.committee)

        self.assertEqual('123 Boulevard St.', 
            vals['address']['street_1'])
        self.assertEqual('#595', vals['address']['street_2'])
        self.assertEqual('Placetown', vals['address']['city'])
        self.assertEqual('23456', vals['address']['zip'])


if __name__ == '__main__':
    unittest.main()
