import unittest
from openfecwebapp.data_prep.committees import *
from openfecwebapp.tests.mock_data import committee

class TestDataMappings(unittest.TestCase):

    def test_map_committee_page_values(self):
        vals = map_committee_page_values(committee)

        self.assertEqual('123 Boulevard St.', 
            vals['address']['street_1'])
        self.assertEqual('#595', vals['address']['street_2'])
        self.assertEqual('Placetown', vals['address']['city'])
        self.assertEqual('23456', vals['address']['zip'])
        self.assertEqual('Partay', vals['type'])
        self.assertEqual('Very Authorized', vals['designation'])        
        self.assertEqual('Money McMaster', vals['treasurer'])
