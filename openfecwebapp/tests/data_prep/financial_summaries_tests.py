import copy
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

    def test_map_committee_financials_empty_reports(self):
        result = copy.deepcopy(totals['results'][0])
        result['reports'] = []
        res = _map_committee_financials(result)
        self.assertNotIn('total_cash', res)
        self.assertNotIn('total_debt', res)

    def test_map_committee_financials_empty_totals(self):
        result = copy.deepcopy(totals['results'][0])
        result['totals'] = []
        res = _map_committee_financials(result)
        self.assertNotIn('total_receipts', res)
        self.assertNotIn('total_disbursements', res)
