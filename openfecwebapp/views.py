import datetime
import collections

from flask import render_template

from openfecwebapp import api_caller


def render_search_results(results, query, result_type):
    return render_template(
        'search-results.html',
        results=results,
        result_type=result_type,
        query=query,
    )


def to_date(committee, cycle):
    if committee['committee_type'] in ['H', 'S', 'P']:
        return None
    return min(datetime.datetime.now().year, cycle)


def render_committee(committee, candidates=None, cycle=None):
    # committee fields will be top-level in the template
    tmpl_vars = committee

    tmpl_vars['cycle'] = cycle
    tmpl_vars['year'] = to_date(committee, cycle)
    tmpl_vars['result_type'] = 'committees'

    # add related candidates a level below
    tmpl_vars['candidates'] = candidates

    financials = api_caller.load_cmte_financials(committee['committee_id'], cycle=cycle)
    tmpl_vars['reports'] = financials['reports']
    tmpl_vars['totals'] = financials['totals']

    return render_template('committees-single.html', **tmpl_vars)


def groupby(values, keygetter):
    ret = {}
    for value in values:
        key = keygetter(value)
        ret.setdefault(key, []).append(value)
    return ret


def aggregate_committees(committees):
    ret = collections.defaultdict(int)
    for each in committees:
        totals = each['totals'][0] if each['totals'] else {}
        reports = each['reports'][0] if each['reports'] else {}
        ret['receipts'] += totals.get('receipts') or 0
        ret['disbursements'] += totals.get('disbursements') or 0
        ret['cash'] += reports.get('cash_on_hand_end_period') or 0
        ret['debt'] += reports.get('debts_owed_by_committee') or 0
        if not ret['start_date'] or reports.get('coverage_start_date') < ret['start_date']:
            ret['start_date'] = reports.get('coverage_start_date')
        if not ret['end_date'] or reports.get('coverage_end_date') > ret['end_date']:
            ret['end_date'] = reports.get('coverage_end_date')
    return ret


def render_candidate(candidate, committees, cycle):
    # candidate fields will be top-level in the template
    tmpl_vars = candidate

    tmpl_vars['cycle'] = cycle
    tmpl_vars['result_type'] = 'candidates'

    committee_groups = groupby(committees, lambda each: each['designation'])
    committees_authorized = committee_groups.get('P', []) + committee_groups.get('A', [])
    for committee in committees_authorized:
        committee.update(
            api_caller.load_cmte_financials(
                committee['committee_id'],
                cycle=cycle,
            )
        )

    tmpl_vars['committee_groups'] = committee_groups
    tmpl_vars['committees_authorized'] = committees_authorized
    tmpl_vars['aggregate'] = aggregate_committees(committees_authorized)

    tmpl_vars['elections'] = sorted(
        zip(candidate['election_years'], candidate['election_districts']),
        key=lambda pair: pair[0],
        reverse=True,
    )

    return render_template('candidates-single.html', **tmpl_vars)
