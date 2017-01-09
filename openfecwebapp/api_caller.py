import os
from urllib import parse
import re

import requests
import cachecontrol
from flask import abort

from openfecwebapp import utils
from openfecwebapp import config

from collections import OrderedDict

MAX_FINANCIALS_COUNT = 4


session = requests.Session()
http_adapter = requests.adapters.HTTPAdapter(max_retries=2)
session.mount('https://', http_adapter)

if config.cache:
    cachecontrol.CacheControl(session, cache=utils.LRUCache(config.cache_size))


def _call_api(*path_parts, **filters):
    if config.api_key:
        filters['api_key'] = config.api_key

    path = os.path.join(config.api_version, *[x.strip('/') for x in path_parts])
    url = parse.urljoin(config.api_location, path)

    results = session.get(url, params=filters)

    return results.json() if results.ok else {}


def load_search_results(query, query_type='candidates'):
    filters = {}

    if query:
        filters['q'] = query
        filters['sort'] = ['-receipts']

    url = '/' + query_type
    if query_type == 'candidates':
        url += '/search'
    results = _call_api(url, **filters)

    return results['results'] if len(results) else []


def load_legal_search_results(query, query_type='all', ao_no=None, ao_name=None,
                                ao_min_date=None, ao_max_date=None, ao_is_pending=None,
                                ao_requestor=None, ao_requestor_type=None, offset=0, limit=20):
    filters = {}
    if query or query_type == 'advisory_opinions':
        filters['hits_returned'] = limit
        filters['type'] = query_type
        filters['from_hit'] = offset

        if query:
            filters['q'] = query

        if ao_no and ao_no[0]:
            filters['ao_no'] = ao_no

        if ao_name and ao_name[0]:
            filters['ao_name'] = ao_name

        if ao_min_date:
            filters['ao_min_date'] = ao_min_date

        if ao_max_date:
            filters['ao_max_date'] = ao_max_date

        if ao_is_pending:
            filters['ao_is_pending'] = True

        if ao_requestor:
            filters['ao_requestor'] = ao_requestor

        print(ao_requestor_type)
        if ao_requestor_type > 0:
            filters['ao_requestor_type'] = ao_requestor_type

    results = _call_api('legal', 'search', **filters)
    results['limit'] = limit
    results['offset'] = offset

    if 'statutes' in results:
        results['statutes_returned'] = len(results['statutes'])

    if 'regulations' in results:
        results['regulations_returned'] = len(results['regulations'])

    if 'advisory_opinions' in results:
        results['advisory_opinions_returned'] = len(results['advisory_opinions'])
        grouped_aos = OrderedDict({})
        for ao in results['advisory_opinions']:
            if ao['no'] in grouped_aos:
                grouped_aos[ao['no']].append(ao)
            else:
                grouped_aos[ao['no']] = [ao]

        for ao_no in grouped_aos:
            grouped_aos[ao_no].sort(key=lambda ao: ao['date'], reverse=True)
        results['advisory_opinions'] = grouped_aos

    if 'murs' in results:
        results['murs_returned'] = len(results['murs'])

    return results


def load_legal_advisory_opinion(ao_no):
    url = '/legal/docs/advisory_opinions/'
    results = _call_api(url, parse.quote(ao_no))

    if not (results and 'docs' in results):
        return None

    # sort by chronological date
    documents = sorted(results['docs'], key=lambda doc: doc['date'])
    if not (documents and len(documents)):
        return None

    for document in documents:
        canonical_document = document
        if document['category'] == 'Final Opinion':
            break

    if not canonical_document:
        return None

    advisory_opinion = {
        'no': ao_no,
        'date': canonical_document['date'],
        'name': canonical_document['name'],
        'summary': canonical_document['summary'],
        'description': canonical_document['description'],
        'url': canonical_document['url'],
        'category': canonical_document['category'],
        'documents': documents,
        'entities': [],
    }

    return advisory_opinion


def load_legal_mur(mur_no):

    url = '/legal/docs/murs/'
    mur = _call_api(url, parse.quote(mur_no))

    if not mur:
        abort(404)

    mur = mur['docs'][0]

    if mur['mur_type'] == 'current':
        complainants = []
        for participant in mur['participants']:
            citations = []
            for stage in participant['citations']:
                for url in participant['citations'][stage]:
                    if 'uscode' in url:
                        section = re.search('section=([0-9]+)', url).group(1)
                        citations.append({'text': section, 'url': url})
                    if 'cfr' in url:
                        title_no = re.search('titlenum=([0-9]+)', url).group(1)
                        part_no = re.search('partnum=([0-9]+)', url).group(1)
                        section_no = re.search('sectionnum=([0-9]+)', url).group(1)
                        text = '%s C.F.R. %s.%s' % (title_no, part_no, section_no)
                        citations.append({'text': text, 'url': url})
            participant['citations'] = citations

            if 'complainant' in participant['role'].lower():
                complainants.append(participant['name'])

        mur['disposition_text'] = [d['text'] for d in mur['disposition']['text']]

        disposition_data = OrderedDict()
        for row in mur['disposition']['data']:
            if row['disposition'] in disposition_data:
                if row['penalty'] in disposition_data[row['disposition']]:
                    disposition_data[row['disposition']][row['penalty']].append(row)
                else:
                    disposition_data[row['disposition']][row['penalty']] = [row]
            else:
                disposition_data[row['disposition']] = OrderedDict({row['penalty']: [row]})

        mur['disposition_data'] = disposition_data
        mur['complainants'] = complainants
        mur['respondents'] = _get_sorted_respondents(mur)
        mur['participants_by_type'] = _get_sorted_participants_by_type(mur)

        documents_by_type = OrderedDict()
        for doc in mur['documents']:
            if doc['category'] in documents_by_type:
                documents_by_type[doc['category']].append(doc)
            else:
                documents_by_type[doc['category']] = [doc]
        mur['documents_by_type'] = documents_by_type
    return mur


def load_single_type(data_type, c_id, *path, **filters):
    data = _call_api(data_type, c_id, *path, **filters)
    return result_or_404(data)


def load_nested_type(parent_type, c_id, nested_type, *path, **filters):
    return _call_api(parent_type, c_id, nested_type, *path, per_page=100, **filters)


def load_with_nested(primary_type, primary_id, secondary_type, cycle=None,
                     cycle_key='cycle', **query):
    path = ('history', str(cycle)) if cycle else ('history', )
    data = load_single_type(primary_type, primary_id, *path, per_page=1, **query)
    cycle = cycle or max(data['cycles'])
    path = ('history', str(data[cycle_key]))
    nested_data = load_nested_type(primary_type, primary_id, secondary_type, *path, **query)
    return data, nested_data['results'], cycle


def load_cmte_financials(committee_id, **filters):
    filters.update({
        'is_amended': 'false',
        'per_page': MAX_FINANCIALS_COUNT,
        'report_type': filters.get('report_type', []) + ['-TER'],
        'sort_hide_null': 'true',
    })

    reports = _call_api('committee', committee_id, 'reports', **filters)
    totals = _call_api('committee', committee_id, 'totals', **filters)

    return {
        'reports': reports['results'],
        'totals': totals['results'],
    }


def load_candidate_totals(candidate_id, cycle, election_full=True):
    response = _call_api(
        'candidates', 'totals',
        candidate_id=candidate_id, cycle=cycle, election_full=election_full,
    )
    if response['results']:
        return response['results'][0]
    return {}


def result_or_404(data):
    if not data.get('results'):
        abort(404)
    return data['results'][0]

def load_top_candidates(sort, office=None, cycle=2016, per_page=5):
        response = _call_api(
            'candidates', 'totals',
            sort_hide_null=True,
            election_year=cycle,
            cycle=cycle,
            election_full=False,
            office=office,
            sort=sort,
            per_page=per_page
        )
        if response['results']:
            return response
        return {}

def load_top_pacs(sort, cycle=2016, per_page=5):
        response = _call_api(
            'totals', 'pac',
            sort_hide_null=True, cycle=cycle, sort=sort, per_page=per_page
        )
        if response['results']:
            return response
        return {}

def load_top_parties(sort, cycle=2016, per_page=5):
        response = _call_api(
            'totals', 'party',
            sort_hide_null=True, cycle=cycle, sort=sort, per_page=per_page
        )
        if response['results']:
            return response
        return {}

def _get_sorted_respondents(mur):
    """
    Returns the respondents in a MUR sorted in the order of most important to least important
    """
    SORTED_RESPONDENT_ROLES = ['Primary Respondent', 'Respondent', 'Previous Respondent']
    respondents = []
    for role in SORTED_RESPONDENT_ROLES:
        respondents.extend(sorted([p['name'] for p in mur['participants'] if p['role'] == role]))
    return respondents

def _get_sorted_participants_by_type(mur):
    """
    Returns the participants in a MUR sorted in the order of most important to least important
    """
    SORTED_PARTICIPANT_ROLES = [
        "Primary Respondent",
        "Respondent",
        "Previous Respondent",
        "Treasurer",
        "Previous Treasurer",
        "Complainant",
        "Respondent's Counsel",
        "Opposing counsel",
        "Representative",
        "Law Firm",
    ]
    participants_by_type = OrderedDict()

    # Prime with sorted roles
    for role in SORTED_PARTICIPANT_ROLES:
        participants_by_type[role] = []

    for participant in mur['participants']:
        participants_by_type[participant['role']].append(participant['name'])

    # Remove roles without participants
    for role in [key for key, value in participants_by_type.items() if not value]:
        del participants_by_type[role]

    # Sort remaining participants
    for key, value in participants_by_type.items():
        participants_by_type[key] = sorted(participants_by_type[key])

    return participants_by_type
