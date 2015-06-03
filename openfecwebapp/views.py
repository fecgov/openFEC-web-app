from flask import render_template
from openfecwebapp.models.shared import generate_pagination_values
from openfecwebapp.api_caller import load_cmte_financials
from werkzeug.exceptions import abort


def render_search_results(results, query, result_type):
    # if true will show "no results" message
    no_results = not len(results)

    return render_template('search-results.html', 
            results=results,
            result_type=result_type,
            query=query,
            no_results=no_results)


# loads browse tabular views
def render_table(data_type, results, params):
    # if we didn't get data back from the API
    if not results:
        abort(500)

    results_table = {}
    results_table[data_type] = []

    results_table['pagination'] = generate_pagination_values(results, params, data_type)
    results_table[data_type] = results['results']

    if params.get('name'):
        results_table['filter_name'] = params['name']

    return render_template(data_type + '.html', **results_table)


def render_committee(data, candidates=None, cycle=None):
    committee = get_first_result_or_raise_500(data)

    # committee fields will be top-level in the template
    tmpl_vars = committee

    tmpl_vars['cycle'] = cycle

    # add related candidates a level below
    tmpl_vars['candidates'] = candidates

    financials = load_cmte_financials(committee['committee_id'], cycle=cycle)
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
    return {
        'receipts': sum(each['totals'][0]['receipts'] for each in committees),
        'disbursements': sum(each['totals'][0]['disbursements'] for each in committees),
        'cash': sum(each['reports'][0]['cash_on_hand_end_period'] for each in committees),
        'debt': sum(each['reports'][0]['debts_owed_by_committee'] for each in committees),
    }


def render_candidate(data, committees, cycle):
    results = get_first_result_or_raise_500(data)

    # candidate fields will be top-level in the template
    tmpl_vars = results

    tmpl_vars['cycle'] = cycle

    committee_groups = groupby(committees, lambda each: each['designation'])
    committees_authorized = committee_groups.get('P', []) + committee_groups.get('A', [])
    for committee in committees_authorized:
        committee.update(load_cmte_financials(committee['committee_id'], cycle=cycle))

    tmpl_vars['committee_groups'] = committee_groups
    tmpl_vars['committees_authorized'] = committees_authorized
    tmpl_vars['aggregate'] = aggregate_committees(committees_authorized)

    return render_template('candidates-single.html', **tmpl_vars)


def get_first_result_or_raise_500(data):
    # not handling error at api module because sometimes its ok to
    # not get data back - like with search results
    if not data.get('results'):
        abort(500)
    else:
        return data['results'][0]
