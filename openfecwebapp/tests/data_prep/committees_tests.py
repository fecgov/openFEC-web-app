import unittest
from openfecwebapp.data_prep.committees import CommitteeSchema
from openfecwebapp.tests.mock_data import committee


class TestDataMappings(unittest.TestCase):

    def test_map_committee_page_values(self):
        vals = CommitteeSchema().load(committee['results'][0]).data

        self.assertEqual('123 Boulevard St.',
                         vals['address']['street_1'])
        self.assertEqual('#595', vals['address']['street_2'])
        self.assertEqual('Placetown', vals['address']['city'])
        self.assertEqual('23456', vals['address']['zip'])
        self.assertEqual('Partay', vals['organization_type_full'])
        self.assertEqual('Authorized', vals['designation_full'])
        self.assertEqual('Money McMaster', vals['treasurer_name'])

        self.assertEqual('Best Candidate', vals['candidates'][0]['candidate_name'])
        self.assertEqual('A2345', vals['candidates'][0]['candidate_id'])
