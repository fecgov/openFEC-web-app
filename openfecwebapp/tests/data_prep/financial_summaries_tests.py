import unittest
from openfecwebapp.data_prep.financial_summaries import  _map_committee_financials
from openfecwebapp.tests.mock_data import *

class TestFinancialSummaries(unittest.TestCase):

    def test_map_committee_financials(self):
        c = _map_committee_financials(totals['results'][0])

        self.assertEqual('$231.45', c['total_receipts'])
        self.assertEqual('$3,453.54', c['total_disbursements'])
        self.assertEqual('$123.34', c['total_cash'])
        self.assertEqual('$45,678.90', c['total_debt'])
        self.assertEqual('2010', c['report_year'])
        self.assertEqual('2009 - 2010', c['years_totals'])
        self.assertEqual('End Report ', c['report_desc'])

        c = _map_committee_financials(totals['results'][1])

        self.assertEqual('$0.00', c['total_receipts'])
        self.assertEqual('$0.00', c['total_disbursements'])
        self.assertEqual('$0.00', c['total_cash'])
        self.assertEqual('$0.00', c['total_debt'])
