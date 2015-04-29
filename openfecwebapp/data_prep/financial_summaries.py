import re
import locale

from marshmallow import Schema, fields, pre_load

from openfecwebapp.api_caller import load_cmte_financials
from openfecwebapp.data_prep.shared import committee_type_map


locale.setlocale(locale.LC_ALL, '')

class Currency(fields.Decimal):
    def _serialize(self, value, attr, obj):
        if value is None:
            return fields.Decimal('0')

        return locale.currency(value, grouping=True)

class CommitteeFinancials(Schema):
    total_receipts = Currency(attribute='receipts')
    total_disbursements = Currency(attribute='disbursements')
    total_cash = Currency(attribute='cash_on_hand_end_period')
    total_debt = Currency(attribute='debts_owed_by_committee')
    report_year = fields.Integer()
    years_totals = fields.Method("format_years_totals")

    def format_years_totals(self, obj):
        return "{} - {}".format(obj.cycle - 1, obj.cycle)

    @pre_load
    def map_totals_and_reports(self, data, many):
        input_data_old = data
        data = {}

        data['reports'] = input_data_old['reports'][0]
        data['totals'] = input_data_old['totals'][0]

        return data


def _map_committee_financials(vals):
    """
    maps and returns template vars for financial summaries
    from the 'totals' endpoint for use on candidate
    and committee pages
    """
    reports = vals['reports'][0] if vals['reports'] else {}
    totals = vals['totals'][0] if vals['totals'] else {}
    totals_mapped = {}
    value_map = {
        'total_receipts': totals.get('receipts'),
        'total_disbursements': totals.get('disbursements'),
        'total_cash': reports.get('cash_on_hand_end_period'),
        'total_debt': reports.get('debts_owed_by_committee')
    }

    # format totals data in US dollars
    for v in value_map:
        if value_map[v] is not None:
            totals_mapped[v] = locale.currency(
            value_map[v], grouping=True)

    if reports.get('report_year'):
        totals_mapped['report_year'] = str(int(reports['report_year']))

    # "calculated from" on site
    if reports.get('cycle'):
        cycle_minus_one = str(int(reports['cycle']) - 1)
        totals_mapped['years_totals'] = cycle_minus_one
        totals_mapped['years_totals'] += ' - '
        totals_mapped['years_totals'] += str(reports['cycle'])

    # "source:" on site
    if reports.get('report_type_full'):
        totals_mapped['report_desc'] = re.sub('{.+}',
            '', reports['report_type_full'])


    return totals_mapped


def _alias_report_fields(report):
    report['cash'] = report['cash_on_hand_end_period']
    report['debt'] = report['debts_owed_by_committee']
    return report


def add_cmte_financial_data(context, data_type):
    full_cmtes = {}
    cmte_designation_map = {
        'P': 'primary_committee',
        'A': 'authorized_committees',
        'D': 'leadership_committees',
        'J': 'joint_committees'
    }

    if data_type == 'candidate':
        full_cmtes['primary_committee'] = []
        full_cmtes['authorized_committees'] = []
        full_cmtes['leadership_committees'] = []
        full_cmtes['joint_committees'] = []
        candidate = context
        cmtes = candidate.get('committees', [])
        for cmte in cmtes:
            if cmte.get('designation') in ['P', 'A', 'D']:
                cmte_financials = load_cmte_financials(cmte['committee_id'])
                cmte.update(_map_committee_financials(cmte_financials))
                cmte['reports'] = map(_alias_report_fields, cmte['reports'])
                tmpl_group = cmte_designation_map[
                    cmte['designation']]
                full_cmtes[tmpl_group].append(cmte)
            elif cmte['designation'] is 'J':
                full_cmtes['joint_committees'].append(cmte)
            else:
                pass
    elif data_type == 'committee':
        cmte = context
        if cmte.get('committee_id'):
            cmte_financials = load_cmte_financials(cmte['committee_id'])
            cmte.update(_map_committee_financials(cmte_financials))
            cmte['reports'] = list(map(_alias_report_fields, cmte['reports']))
        full_cmtes = {'financial_summary': cmte}
    else:
        pass
    return full_cmtes
