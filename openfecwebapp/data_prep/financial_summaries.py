import re
import locale

from openfecwebapp.api_caller import load_totals
from openfecwebapp.data_prep.shared import committee_type_map

locale.setlocale(locale.LC_ALL, '')

def _map_committee_financials(vals):
    """
    maps and returns template vars for financial summaries
    from the 'totals' endpoint for use on candidat
    and committee pages
    """
    reports = vals['reports']
    totals = vals['totals']
    totals_mapped = {}
    value_map = {
        'total_receipts': totals.get('receipts'),
        'total_disbursements': totals.get('disbursements'),
        'total_cash': reports.get('cash_on_hand_end_period'),
        'total_debt': reports.get('debts_owed_by_committee')
    }

    # format totals data in US dollars
    for v in value_map:
        if value_map[v]:
            totals_mapped[v] = locale.currency(
            value_map[v], grouping=True)
        else:
            totals_mapped[v] = 'unavailable'

    if reports.get('report_year'):
        totals_mapped['report_year'] = str(int(reports['report_year']))

    # "calculated from" on site
    if reports.get('election_cycle'):
        cycle_minus_one = str(int(reports['election_cycle']) - 1)
        totals_mapped['years_totals'] = cycle_minus_one 
        totals_mapped['years_totals'] += ' - ' 
        totals_mapped['years_totals'] += str(reports['election_cycle'])

    # "source:" on site
    if reports.get('report_type_full'):
        totals_mapped['report_desc'] = re.sub('{.+}', 
            '', reports['report_type_full']) 

    return totals_mapped

def _get_reports_totals_results(results):
    """ drills down to the meat of the json response from
    the API. results['results'][0]['reports'][0]
    """
    reports = results.get('reports', {})
    totals = results.get('totals', {})
    if reports:
        reports = reports[0]
    if totals:
        totals = totals[0]
    return {'reports': reports, 'totals': totals}

def _get_committee_page_financials(context):
    """ loads financial summary data for display
    on committee pages
    """
    results = load_totals(context['committee_id'])
    context['totals'] = _map_committee_financials(
        _get_reports_totals_results(results['results'][0]))

    return context

def _map_committee_financials_by_type(results, types):
    """ takes the results of a call to the totals endpoint
    and organizes it in a way where it can be templated
    """
    cmtes = {}
    for r in results['results']:
        c_id = r['committee_id']
        cmte_type = types[c_id]
        if not cmtes.get(cmte_type):
            cmtes[cmte_type] = {}
        cmtes[cmte_type][c_id] = _map_committee_financials(
            _get_reports_totals_results(r))

    return cmtes

def _get_pc_financials(context):
    """ glues getting primary committee financial summary data from
    API, mapping the values for templating
    """
    c = {}
    totals = load_totals(context['primary_committee']['id'])
    results = _get_reports_totals_results(totals['results'][0])
    c = _map_committee_financials(results)
    c['name'] = context['primary_committee']['name']

    return c

def _filter_affiliated_committees(context):
    """ creates a dict of the committee types that we want
    to display on a candidate page and that exist in the
    data set. also returns comma separated committee ids
    for each affiliated committee and a mapping of ids
    to committee types
    """
    c = {}
    committee_ids = []
    cmte_map = {}
    for cmte in context['affiliated_committees'].values():
        if cmte['designation_code'] in committee_type_map: 
            committee_ids.append(cmte['id'])
            cmte_type = committee_type_map[
                cmte['designation_code']]
            if not c.get(cmte_type):
                c[cmte_type] = {}
            c[cmte_type][cmte['id']] = cmte
            cmte_map[cmte['id']] = committee_type_map[cmte[
                'designation_code']]

    return [c, ",".join(committee_ids), cmte_map]

def add_committee_financial_data(context, data_type):
    """ loads and maps for templating financial summary data
    for each of the committees related to a candidate that are
    of the type we display, or for a committee itself
    """
    if data_type == 'candidate':
        if context.get('primary_committee'):
            context['primary_committee'].update(
                _get_pc_financials(context))
        if context.get('affiliated_committees'):
            ac = _filter_affiliated_committees(context)
            context.update(ac[0])
            results = load_totals(ac[1])
            if results:
                financials = _map_committee_financials_by_type(results, ac[2])
                # updates specific candidate dicts so that we don't
                # blow away data they currently hold in doing
                # context.update(financials)
                for c_type in financials:
                    for c_id in financials[c_type]:
                        context[c_type][c_id].update(
                            financials[c_type][c_id])        
    elif data_type == 'committee':
        context.update(_get_committee_page_financials(context))

    return context
