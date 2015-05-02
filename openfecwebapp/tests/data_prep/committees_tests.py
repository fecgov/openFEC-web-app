import unittest
from openfecwebapp.models.committees import CommitteeSchema
from openfecwebapp.tests.mock_data import committee


class TestDataMappings(unittest.TestCase):

    def test_map_committee_page_values(self):
        vals = CommitteeSchema().load(committee['results'][0]).data

        self.assertEqual('123 Boulevard St.',
                         vals['street_1'])
        self.assertEqual('#595', vals['street_2'])
        self.assertEqual('Placetown', vals['city'])
        self.assertEqual('23456', vals['zip'])
        self.assertEqual('Partay', vals['organization_type_full'])
        self.assertEqual('Authorized', vals['designation_full'])
        self.assertEqual('Money McMaster', vals['treasurer_name'])
