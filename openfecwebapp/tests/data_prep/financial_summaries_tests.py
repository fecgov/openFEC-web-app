import copy
import unittest

from openfecwebapp.models.financial_summaries import TotalsSchema
from openfecwebapp.tests.mock_data import *


class TestFinancialSummaries(unittest.TestCase):

    def test_map_committee_financials(self):
        c = self._map_totals(totals['results'])

        self.assertEqual('$231.45', c[0]['total_receipts'])
        self.assertEqual('$3,453.54', c[0]['total_disbursements'])
        self.assertEqual('$123.34', c[0]['total_cash'])
        self.assertEqual('$45,678.90', c[0]['total_debt'])
        self.assertEqual('2010', c[0]['report_year'])
        self.assertEqual('2009 - 2010', c[0]['years_totals'])
        self.assertEqual('End Report ', c[0]['report_desc'])

        self.assertEqual('$0.00', c[1]['total_receipts'])
        self.assertEqual('$0.00', c[1]['total_disbursements'])
        self.assertEqual('$0.00', c[1]['total_cash'])
        self.assertEqual('$0.00', c[1]['total_debt'])

    def test_map_committee_financials_empty_reports(self):
        result = copy.deepcopy(totals['results'][0])
        result['reports'] = []
        res = self._map_totals(result)
        self.assertNotIn('total_cash', res)
        self.assertNotIn('total_debt', res)

    def test_map_committee_financials_empty_totals(self):
        result = copy.deepcopy(totals['results'][0])
        result['totals'] = []
        res = self._map_totals(result)
        self.assertNotIn('total_receipts', res)
        self.assertNotIn('total_disbursements', res)

    def _map_totals(self, data):
        return TotalsSchema().dump(data).data
