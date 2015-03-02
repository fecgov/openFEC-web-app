import unittest
from openfecwebapp.data_prep.financial_summaries import (
 _map_committee_financials, add_committee_financial_data,
_get_reports_totals_results, _make_dicts_for_financials,
_filter_affiliated_committees)
from openfecwebapp.tests.mock_data import *

class TestFinancialSummaries(unittest.TestCase):

    def test_map_committee_financials(self):
        results = {
            'reports': totals['results'][0]['reports'][0],
            'totals': totals['results'][0]['totals'][0]
        }
        c = _map_committee_financials(results)

        self.assertEqual('$231.45', c['total_receipts'])
        self.assertEqual('$3,453.54', c['total_disbursements'])
        self.assertEqual('$123.34', c['total_cash'])
        self.assertEqual('$45,678.90', c['total_debt'])
        self.assertEqual('2010', c['report_year'])
        self.assertEqual('2009 - 2010', c['years_totals'])
        self.assertEqual('End Report ', c['report_desc'])

        results = {
            'reports': totals['results'][1]['reports'][0],
            'totals': totals['results'][1]['totals'][0]
        }
        c = _map_committee_financials(results)

        self.assertEqual('$0.00', c['total_receipts'])
        self.assertEqual('$0.00', c['total_disbursements'])
        self.assertEqual('$0.00', c['total_cash'])
        self.assertEqual('$0.00', c['total_debt'])

    def test_get_reports_totals_results(self):
        c = _get_reports_totals_results(totals['results'][0])

        self.assertEqual(231.45, c['totals']['receipts'])
        self.assertEqual(3453.54, c['totals']['disbursements'])
        self.assertEqual(123.34, c['reports']['cash_on_hand_end_period'])
        self.assertEqual(45678.90, c['reports']['debts_owed_by_committee'])
        self.assertEqual(2010, c['reports']['report_year'])
        self.assertEqual('End Report {stuff}', c['reports']['report_type_full'])

    def test_make_dicts_for_financials(self):
        c_types = {'D1234': 'authorized_committees'}
        c = _make_dicts_for_financials(totals, c_types) 

        self.assertTrue(c['authorized_committees']['D1234'])

    def test_filter_affiliated_committees(self):
        c = _filter_affiliated_committees(candidate)

        self.assertTrue(c[0]['authorized_committees']['D1234'])
        self.assertEqual('D1234', c[1])
        self.assertEqual({'D1234': 'authorized_committees'}, c[2])
