import datetime

import furl

from flask.views import MethodView
from flask import request, render_template, redirect, url_for, jsonify
from flask_cors import cross_origin

from webargs import fields
from webargs.flaskparser import use_kwargs
from marshmallow import ValidationError
from collections import OrderedDict

import datetime

import github3
from werkzeug.utils import cached_property

from openfecwebapp import config
from openfecwebapp import api_caller
from openfecwebapp import utils

def render_search_results(results, query, result_type):
    return render_template(
        'search-results.html',
        parent='data',
        results=results,
        result_type=result_type,
        query=query,
    )


def render_legal_search_results(results, query, result_type):
    return render_template(
        'legal-search-results.html',
        parent='legal',
        query=query,
        results=results,
        result_type=result_type,
        category_order=get_legal_category_order(results, config.features['legal_murs']),
    )


def render_legal_doc_search_results(results, query, result_type, ao_no, ao_name,
                ao_min_date, ao_max_date, ao_is_pending, ao_requestor, ao_requestor_type,
                ao_category):
    return render_template(
        'legal-search-results-%s.html' % result_type,
        parent='legal',
        results=results,
        result_type=result_type,
        query=query,
        ao_no=ao_no,
        ao_name=ao_name,
        ao_min_date=ao_min_date,
        ao_max_date=ao_max_date,
        ao_is_pending=ao_is_pending,
        ao_requestor=ao_requestor,
        ao_requestor_type=ao_requestor_type,
        ao_category=ao_category
    )


def render_legal_advisory_opinion(advisory_opinion):
    return render_template(
        'legal-advisory-opinion.html',
        advisory_opinion=advisory_opinion,
        parent='legal'
    )


def render_legal_mur(mur):
    return render_template(
        'legal-%s-mur.html' % mur['mur_type'],
        mur=mur,
        parent='legal'
    )

def render_legal_ao_landing():
    today = datetime.date.today()
    ao_min_date = today - datetime.timedelta(weeks=26)
    ao_results = api_caller.load_legal_search_results(query='', query_type='advisory_opinions', ao_min_date=ao_min_date)
    return render_template('legal-advisory-opinions-landing.html',
        parent='legal',
        result_type='advisory_opinions',
        display_name='advisory opinions',
        recent_aos=ao_results['advisory_opinions'])


def to_date(committee, cycle):
    if committee['committee_type'] in ['H', 'S', 'P']:
        return None
    return min(datetime.datetime.now().year, cycle)


def render_committee(committee, candidates, cycle, redirect_to_previous):
    # committee fields will be top-level in the template
    tmpl_vars = committee

    tmpl_vars['parent'] = 'data'
    tmpl_vars['cycle'] = cycle
    tmpl_vars['year'] = to_date(committee, cycle)
    tmpl_vars['result_type'] = 'committees'

    # Link to current cycle if candidate has a corresponding page, else link
    # without cycle query parameter
    # See https://github.com/18F/openFEC/issues/1536
    for candidate in candidates:
        election_years = [
            election_year for election_year in candidate['election_years']
            if election_year - election_durations[candidate['office']] < cycle <= election_year
        ]
        candidate['related_cycle'] = max(election_years) if election_years else None

    # add related candidates a level below
    tmpl_vars['candidates'] = candidates
    financials = api_caller.load_cmte_financials(committee['committee_id'], cycle=cycle)

    tmpl_vars['report_type'] = report_types.get(committee['committee_type'], 'pac-party')
    tmpl_vars['reports'] = financials['reports']
    tmpl_vars['totals'] = financials['totals']

    tmpl_vars['context_vars'] = {
        'cycle': cycle,
        'timePeriod': str(cycle - 1) + '–' + str(cycle),
        'name': committee['name'],
    }

    if financials['reports'] and financials['totals']:
        # Format the current two-year-period's totals using the process utilities
        if committee['committee_type'] == 'I':
            # IE-only committees have very little data, so they just get this one
            tmpl_vars['ie_summary'] = utils.process_ie_data(financials['totals'][0])
        else:
            # All other committees have three tables
            tmpl_vars['raising_summary'] = utils.process_raising_data(financials['totals'][0])
            tmpl_vars['spending_summary'] = utils.process_spending_data(financials['totals'][0])
            tmpl_vars['cash_summary'] = utils.process_cash_data(financials['totals'][0])

    if redirect_to_previous and not financials['reports']:
        # If there's no reports, find the first year with reports and redirect there
        for c in sorted(committee['cycles'], reverse=True):
            financials = api_caller.load_cmte_financials(committee['committee_id'], cycle=c)
            if financials['reports']:
                return redirect(
                    url_for('committee_page', c_id=committee['committee_id'], cycle=c)
                )
    return render_template('committees-single.html', **tmpl_vars)


def groupby(values, keygetter):
    ret = {}
    for value in values:
        key = keygetter(value)
        ret.setdefault(key, []).append(value)
    return ret


election_durations = {
    'P': 4,
    'S': 6,
    'H': 2,
}

report_types = {
    'P': 'presidential',
    'S': 'house-senate',
    'H': 'house-senate',
    'I': 'ie-only'
}

def render_candidate(candidate, committees, flag, cycle, election_full=True):
    # candidate fields will be top-level in the template
    tmpl_vars = candidate

    tmpl_vars['parent'] = 'data'
    tmpl_vars['cycle'] = cycle
    tmpl_vars['result_type'] = 'candidates'
    tmpl_vars['duration'] = election_durations.get(candidate['office'], 2)
    tmpl_vars['election_full'] = election_full
    tmpl_vars['aggregate_cycles'] = (
        list(range(cycle, cycle - tmpl_vars['duration'], -2))
        if election_full
        else [cycle]
    )

    # Annotate committees with most recent available cycle
    for committee in committees:
        committee['related_cycle'] = (
            max(cycle for cycle in tmpl_vars['aggregate_cycles'] if cycle in committee['cycles'])
            if election_full
            else candidate['two_year_period']
        )

    committee_groups = groupby(committees, lambda each: each['designation'])
    committees_authorized = committee_groups.get('P', []) + committee_groups.get('A', [])

    aggregate = api_caller.load_candidate_totals(
        candidate['candidate_id'],
        cycle=cycle,
        election_full=election_full,
    )

    statement_of_candidacy = api_caller.load_candidate_statement_of_candidacy(
        candidate['candidate_id'],
        cycle=cycle
    )

    if statement_of_candidacy:
        for statement in statement_of_candidacy:
            # convert string to python datetime and parse for readable output
            statement['receipt_date'] = datetime.datetime.strptime(statement['receipt_date'], '%Y-%m-%dT%H:%M:%S')
            statement['receipt_date'] = statement['receipt_date'].strftime('%m/%d/%Y')

    tmpl_vars['statement_of_candidacy'] = statement_of_candidacy

    tmpl_vars['committee_groups'] = committee_groups
    tmpl_vars['committees_authorized'] = committees_authorized
    tmpl_vars['committee_ids'] = [committee['committee_id'] for committee in committees_authorized]
    tmpl_vars['aggregate'] = aggregate

    tmpl_vars['elections'] = sorted(
        zip(candidate['election_years'], candidate['election_districts']),
        key=lambda pair: pair[0],
        reverse=True,
    )
    tmpl_vars['election_year'] = next(
        (year for year in sorted(candidate['election_years']) if year >= cycle),
        None,
    )

    tmpl_vars['report_type'] = report_types.get(candidate['office'])
    tmpl_vars['context_vars'] = {'cycles': candidate['cycles'], 'name': candidate['name']}

    tmpl_vars['cycles'] = [cycle for cycle in candidate['cycles'] if cycle <= max(candidate['election_years'])]

    tmpl_vars['raising_summary'] = utils.process_raising_data(aggregate)
    tmpl_vars['spending_summary'] = utils.process_spending_data(aggregate)
    tmpl_vars['cash_summary'] = utils.process_cash_data(aggregate)

    if flag == 'new':
        return render_template('candidates-single-new.html', **tmpl_vars)
    else:
        return render_template('candidates-single.html', **tmpl_vars)


def validate_referer(referer):
    if furl.furl(referer).host != furl.furl(request.url).host:
        raise ValidationError('Invalid referer.')

class GithubView(MethodView):

    decorators = [cross_origin()]

    @cached_property
    def repo(self):
        client = github3.login(token=config.github_token)
        return client.repository('18F', 'fec')

    @use_kwargs({
        'referer': fields.Url(
            required=True,
            validate=validate_referer,
            location='headers',
        ),
        'action': fields.Str(),
        'feedback': fields.Str(),
        'about': fields.Str(),
        'chart_reaction': fields.Str(),
        'chart_location': fields.Str(),
        'chart_name': fields.Str(),
        'chart_comment': fields.Str()

    })
    def post(self, **kwargs):
        if not any([kwargs['action'], kwargs['feedback'], kwargs['about'], kwargs['chart_comment']]):
            return jsonify({
                'message': 'Must provide one of "action", "feedback", or "about".',
            }), 422
        if kwargs['chart_comment']:
            title = 'Chart reaction on {} page'.format(kwargs['chart_location'])
        else:
            title = 'User feedback on {}'.format(kwargs['referer'])
        body = render_template('feedback.html', headers=request.headers, **kwargs)
        issue = self.repo.create_issue(title, body=body)
        return jsonify(issue.to_json()), 201

def get_legal_category_order(results, murs_enabled=True):
    """ Return categories in pre-defined order, moving categories with empty results
        to the end. MURs must be at the end if not enabled.
    """
    if murs_enabled:
        categories = ["statutes", "regulations", "advisory_opinions", "murs"]
        category_order = [x for x in categories if results.get("total_" + x, 0) > 0] +\
                        [x for x in categories if results.get("total_" + x, 0) == 0]
    else:
        categories = ["statutes", "regulations", "advisory_opinions"]
        category_order = [x for x in categories if results.get("total_" + x, 0) > 0] +\
                        [x for x in categories if results.get("total_" + x, 0) == 0] +\
                        ["murs"]
    return category_order
