from flask import render_template
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


def render_candidate(data, committees, cycle):
    results = get_first_result_or_raise_500(data)

    # candidate fields will be top-level in the template
    tmpl_vars = results

    tmpl_vars['cycle'] = cycle

    # add 'committees' level to template
    tmpl_vars['has_authorized_cmtes'] = False
    tmpl_vars['has_joint_cmtes'] = False
    tmpl_vars['has_leadership_cmtes'] = False

    for committee in committees:
        if committee['designation'] in ('P', 'A'):  # (P)rimary or (A)uthorized
            # this adds committee['reports'] and committee['totals']
            committee.update(load_cmte_financials(committee['committee_id'], cycle=cycle))
            tmpl_vars['has_authorized_cmtes'] = True

        elif committee['designation'] == 'J':  # (J)oint
            tmpl_vars['has_joint_cmtes'] = True

        elif committee['designation'] == 'D':  # Leadership
            tmpl_vars['has_leadership_cmtes'] = True

    tmpl_vars['committees'] = committees

    return render_template('candidates-single.html', **tmpl_vars)


def get_first_result_or_raise_500(data):
    # not handling error at api module because sometimes its ok to
    # not get data back - like with search results
    if not data.get('results'):
        abort(500)
    else:
        return data['results'][0]
