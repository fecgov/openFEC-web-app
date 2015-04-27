import re
import locale

from openfecwebapp.api_caller import load_cmte_financials
from openfecwebapp.data_prep.shared import committee_type_map

locale.setlocale(locale.LC_ALL, '')

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
    report['receipts'] = report['total_receipts_period']
    report['disbursements'] = report['total_disbursements_period']
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
            if cmte.get('committee_designation') in ['P', 'A', 'D']:
                cmte.update(load_cmte_financials(cmte['committee_id']))
                cmte.update(_map_committee_financials(cmte))
                cmte['reports'] = map(_alias_report_fields, cmte['reports'])
                tmpl_group = cmte_designation_map[
                    cmte['committee_designation']]
                full_cmtes[tmpl_group].append(cmte)

            elif cmte['committee_designation'] is 'J':
                full_cmtes['joint_committees'].append(cmte)
            else:
                pass
    elif data_type == 'committee':
        cmte = context
        if cmte.get('committee_id'):
            cmte.update(load_cmte_financials(cmte['committee_id']))
            cmte.update(_map_committee_financials(cmte))
            cmte['reports'] = list(map(_alias_report_fields, cmte['reports']))

    else:
        pass
    return full_cmtes
