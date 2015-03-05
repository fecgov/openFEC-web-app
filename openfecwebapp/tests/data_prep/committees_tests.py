import unittest
from openfecwebapp.data_prep.committees import *
from openfecwebapp.tests.mock_data import committee

class TestDataMappings(unittest.TestCase):

    def test_map_committee_page_values(self):
        vals = map_committee_page_values(committee['results'][0])

        self.assertEqual('123 Boulevard St.', 
            vals['address']['street_1'])
        self.assertEqual('#595', vals['address']['street_2'])
        self.assertEqual('Placetown', vals['address']['city'])
        self.assertEqual('23456', vals['address']['zip'])
        self.assertEqual('Partay', vals['organization'])
        self.assertEqual('Authorized', vals['designation'])        
        self.assertEqual('Money McMaster', vals['treasurer'])

        self.assertEqual('Best Candidate', vals['candidates'][0]['name'])
        self.assertEqual('A2345', vals['candidates'][0]['candidate_id'])
