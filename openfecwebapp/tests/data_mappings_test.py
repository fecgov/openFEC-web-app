import unittest
from openfecwebapp.data_mappings import *

class TestDataMappings(unittest.TestCase):

    def test_map_candidate_table_values(self):
        input_obj = {
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
            'candidate_id': 'A12345'
        }
        vals = map_candidate_table_values(input_obj)

        self.assertEqual('Person McPersonson', vals['name'])
        self.assertEqual('Supreme Ruler', vals['office'])
        self.assertEqual(2012, vals['election'])
        self.assertEqual('TN', vals['state'])
        self.assertEqual(11, vals['district'])
        self.assertEqual('A12345', vals['id'])
        self.assertEqual('/candidates/A12345', vals['nameURL'])


if __name__ == '__main__':
    unittest.main()
