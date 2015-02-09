import re
import locale

from flask import url_for

locale.setlocale(locale.LC_ALL, '')

def generate_pagination_values(c, params, url, data_type):
    """
    returns template vars for pagination results counts and
    next/prev links on tabular views like /committees,
    /candidates and search results
    """
    pagination = {}
    per_page = int(c['pagination']['per_page'])
    page = int(c['pagination']['page'])
    count = int(c['pagination']['count'])
    current_results_start = per_page * (page - 1) + 1 
    current_results_end = min(per_page * page, count)
    total_pages = int(c['pagination']['pages'])

    pagination['results_count'] = c['pagination']['count']
    pagination['page'] = page
    pagination['per_page'] = per_page
    pagination['current_results_start'] = current_results_start
    pagination['current_results_end'] = current_results_end

    if current_results_start or current_results_end:
        pagination['results_range'] = True

    # next url
    if page < total_pages:
        next_page_num = str(page + 1)
        params['page'] = next_page_num
        pagination['next_url'] = url_for(data_type, **params) 
        pagination['pagination_links'] = True

    # prev url
    if page - 1 > 0:
        prev_page_num = str(page - 1)
        params['page'] = prev_page_num
        pagination['prev_url'] = url_for(data_type, **params) 
        pagination['pagination_links'] = True

    return pagination

def map_candidate_table_values(c):
    """
    maps and returns template vars for a single candidate
    record. 
    """
    candidate = {
        'name': c['name']['full_name'],
        'office': c['elections'][0]['office_sought_full'],
        'election': int(c['elections'][0]['election_year']),
        'party': c['elections'][0]['party_affiliation'],
        'state': c['elections'][0]['state'],
        'district': int(c['elections'][0]['district']) 
            if c['elections'][0]['district'] else '',
        'name_url': '/candidates/' + c['candidate_id']
            if c['candidate_id'] else '',
        'id': c['candidate_id']
    }

    return candidate

def map_committee_table_values(c):
    """
    maps and returns template vars for a single committee
    record. 
    """
    committee = {}

    if c.get('description'):
        committee['name'] = c['description'].get('name', '')
        committee['organization'] = c['description'].get(
            'organization_type_full', '')

    if c.get('treasurer'):
        committee['treasurer'] = c['treasurer'].get('name_full', '')

    if c.get('address'):
        committee['state'] = c['address'].get('state')

    if c.get('status'):
        committee['type'] = c['status'].get('type_full', '')
        committee['designation'] = c['status'].get(
            'designation_full', '')

    if c.get('committee_id'):
        committee['name_url'] ='/committees/' + c.get('committee_id', '')
        committee['id'] = c.get('committee_id', '')

    return committee

def _map_committee_values(ac):
    """
    maps and returns template vars for committee values that 
    are shown on candidate pages
    """
    c = {}
    c['id'] = ac.get('committee_id', '') 
    c['name'] = ac.get('committee_name', '')
    c['designation'] = ac.get('designation_full', '')
    c['designation_code'] = ac.get('designation', '')

    if ac.get('committee_id'):
        c['url'] = '/committees/' + ac.get('committee_id', '')
    return c

def map_totals(t):
    """
    maps and returns template vars for financial summaries
    from the 'totals' endpoint for use on candidat
    and committee pages
    """
    reports = t['results'][0]['reports'][0]
    totals = t['results'][0]['totals'][0]
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

# we want to show the committees on their related candidate 
# pages in this order, with primary committees on top
committee_type_map = {
    'A': 'authorized_committees',
    'D': 'leadership_committees',
    'J': 'joint_committees'
}

def map_candidate_page_values(c):
    """
    returns template vars for rendering a single candidate page
    """
    candidate = map_candidate_table_values(c)

    if c.get('elections'):
        c_e = c['elections'][0]
        candidate['incumbent_challenge'] = c_e.get(
            'incumbent_challenge_full', '')
        if c_e.get('primary_committee'):
            candidate['primary_committee'] = _map_committee_values(
                c_e['primary_committee'])
            candidate['related_committees'] = True

        # affiliated committees = committee_type_map, 
        # plus more we ignore for the candidate pages
        if c_e.get('affiliated_committees'):
            candidate['affiliated_committees'] = [
                _map_committee_values(c)
                for c in c_e['affiliated_committees']
            ]
            candidate['authorized_committees'] = []
            candidate['leadership_committees'] = []
            candidate['joint_committees'] = []

            for cmte in candidate['affiliated_committees']:
                cmte_type = cmte['designation_code']
                # drop anything that's not of the types we're
                # interested in
                if (cmte_type in committee_type_map):
                    candidate[committee_type_map[
                        cmte_type]].append(cmte)
                    candidate['related_committees'] = True

    return candidate

def map_committee_page_values(c):
    """
    returns template vars for rendering a single committee page
    """
    committee = map_committee_table_values(c)

    committee['address'] = c.get('address', {})

    return committee

type_map = {
    'candidates': map_candidate_table_values,
    'candidate': map_candidate_page_values,
    'committees': map_committee_table_values,
    'committee': map_committee_page_values
}
