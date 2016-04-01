import http

import furl
from webargs import fields
from webargs.flaskparser import use_kwargs
from flask import render_template, request, redirect, url_for, abort

from openfecwebapp import app
from openfecwebapp import views
from openfecwebapp import utils
from openfecwebapp import config
from openfecwebapp import constants
from openfecwebapp import api_caller


@app.route('/')
def search():
    query = request.args.get('search')
    if query:
        result_type = request.args.get('search_type') or 'candidates'
        results = api_caller.load_search_results(query, result_type)
        return views.render_search_results(results, query, result_type)
    else:
        return render_template('search.html', page='home', dates=utils.date_ranges())

@app.route('/api/')
def api():
    """Redirect to API as described at
    https://18f.github.io/API-All-the-X/pages/developer_hub_kit.
    """
    return redirect(config.api_location, http.client.MOVED_PERMANENTLY)

@app.route('/developers/')
def developers():
    """Redirect to developer portal as described at
    https://18f.github.io/API-All-the-X/pages/developer_hub_kit.
    """
    url = furl.furl(config.api_location)
    url.path.add('developers')
    return redirect(url.url, http.client.MOVED_PERMANENTLY)

@app.route('/candidate/<c_id>/')
@use_kwargs({
    'cycle': fields.Int(),
    'election_full': fields.Bool(missing=True),
})
def candidate_page(c_id, cycle=None, election_full=True):
    """Fetch and render data for candidate detail page.

    :param int cycle: Optional cycle for associated committees and financials.
    :param bool election_full: Load full election period
    """
    candidate, committees, cycle = api_caller.load_with_nested(
        'candidate', c_id, 'committees',
        cycle=cycle, cycle_key='two_year_period',
        election_full=election_full,
    )
    if election_full and cycle and cycle not in candidate['election_years']:
        next_cycle = next(
            (
                year for year in sorted(candidate['election_years'])
                if year > cycle
            ),
            max(candidate['election_years']),
        )
        return redirect(
            url_for('candidate_page', c_id=c_id, cycle=next_cycle, election_full='true')
        )
    return views.render_candidate(candidate, committees, cycle, election_full)

@app.route('/committee/<c_id>/')
@use_kwargs({
    'cycle': fields.Int(),
})
def committee_page(c_id, cycle=None):
    """Fetch and render data for committee detail page.

    :param int cycle: Optional cycle for financials.
    """
    committee, candidates, cycle = api_caller.load_with_nested('committee', c_id, 'candidates', cycle)
    return views.render_committee(committee, candidates, cycle)

@app.route('/candidates/')
def candidates():
    return render_template('candidates.html', result_type='candidates')

@app.route('/candidates/<office>/')
def candidates_office(office):
    if office.lower() not in ['president', 'senate', 'house']:
        abort(404)
    return render_template('candidates-office.html', result_type='candidates', office=office)

@app.route('/committees/')
def committees():
    return render_template(
        'committees.html',
        result_type='committees',
        dates=utils.date_ranges(),
    )

@app.route('/receipts/')
def receipts():
    return render_template('receipts.html', dates=utils.date_ranges())

@app.route('/disbursements/')
def disbursements():
    return render_template('disbursements.html', dates=utils.date_ranges())

@app.route('/filings/')
def filings():
    return render_template(
        'filings.html',
        dates=utils.date_ranges(),
        result_type='committees',
    )

@app.route('/independent-expenditures/')
def independent_expenditures():
    return render_template('independent-expenditures.html', dates=utils.date_ranges())

@app.route('/electioneering-communications/')
def electioneering_communications():
    return render_template('electioneering-communications.html', dates=utils.date_ranges())

@app.route('/communication-costs/')
def communication_costs():
    return render_template('communication-costs.html', dates=utils.date_ranges())

@app.route('/elections/')
def election_lookup():
    return render_template('election-lookup.html')

@app.route('/elections/<office>/<int:cycle>/')
@app.route('/elections/<office>/<state>/<int:cycle>/')
@app.route('/elections/<office>/<state>/<district>/<int:cycle>/')
def elections(office, cycle, state=None, district=None):
    if office.lower() not in ['president', 'senate', 'house']:
        abort(404)
    if state and state.upper() not in constants.states:
        abort(404)
    cycles = utils.get_cycles()
    if office.lower() == 'president':
        cycles = [each for each in cycles if each % 4 == 0]
    return render_template(
        'elections.html',
        office=office,
        office_code=office[0],
        cycle=cycle,
        cycles=cycles,
        state=state,
        state_full=constants.states[state.upper()] if state else None,
        district=district,
        title=utils.election_title(cycle, office, state, district),
    )

@app.route('/legal/search/')
def legal_search():
    query = request.args.get('search')
    result_type = request.args.get('search_type') or 'all'

    # Stub the results for now
    results = {
        'regulations': [
            {
                'id': 1,
                'name' : 'Independent expenditures',
                'hit_text': '§ 100.113 Independent expenditures. An independent ' \
                            'expenditure that meets the requirements of 11 CFR ' \
                            '104.4 or part 109 is an expenditure, and such ' \
                            'independent expenditure is to be reported by the ' \
                            'person making the expenditure in accordance with 11 ' \
                            'CFR 104.4 and part 109.',
            },
            {
                'id': 2,
                'name' : 'Independent expenditures',
                'hit_text': '§ 100.113 Independent expenditures. An independent ' \
                            'expenditure that meets the requirements of 11 CFR ' \
                            '104.4 or part 109 is an expenditure, and such ' \
                            'independent expenditure is to be reported by the ' \
                            'person making the expenditure in accordance with 11 ' \
                            'CFR 104.4 and part 109.',
            },
        ],
        'advisory_opinions': [
            {
                'id': 1,
                'no' : 'AO 2015-14',
                'name': 'Hillary for America',
                'hit_text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam turpis ligula, sodales ' \
                            'ut dolor quis, dictum congue lacus. Sed urna nunc, volutpat ac porta eu, cursus a ' \
                            'nisi. Aenean eu.'
            },
            {
                'id': 1,
                'no' : 'AO 2014-20',
                'name': 'Make Your Laws PAC',
                'hit_text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam turpis ligula, sodales ' \
                            'ut dolor quis, dictum congue lacus. Sed urna nunc, volutpat ac porta eu, cursus a ' \
                            'nisi. Aenean eu.'
            },
        ],
        'murs': [
            {
                'id': 1,
                'no': '002',
                'date': '08/06/2000',
                'case_name': 'Westchester Coalition for Legal Defense',
                'type': 'adr',
            },
            {
                'id': 1,
                'no': '6775',
                'date': '02/10/2015',
                'case_name': 'Ready for Hillary PAC',
                'type': 'mur',
            },
            {
                'id': 1,
                'no': '1951',
                'date': '05/11/2010',
                'case_name': 'Citizens for Harken',
                'type': 'af',
            },
        ],
    }

    return views.render_legal_search_results(results, query, result_type)
