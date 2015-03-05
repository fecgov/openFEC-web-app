candidate = {
    'pagination': {
        'per_page': '20',
        'page': '2',
        'pages': '5',
        'count': '100'
    },
    'results': [{
        'candidate_id': 'A12345',
        'name': 'Person McPersonson',
        'active_through': '2012',
        'party_full': 'Cool People',
        'state': 'TN',
        'election_year': '2012',
        'office_full': 'Supreme Ruler',
        'district': '11',
        'incumbent_challenge_full': 'challenger',
        'committees': [
            {
                'committee_id': 'D1234',
                'committee_name': 'Friends of McPersonson',
                'committee_designation': 'P',
                "committee_designation_full": "Principal campaign committee"
            },
            {
                'committee_id': 'D1234',
                'committee_name': 'Friends of McPersonson',
                'committee_designation': 'A',
                'committee_designation_full': 'Authorized committee' 
            }
        ]
    }],
    # gets generated later, manually inserted for sake of testing
    'primary_committee': {
        'committee_id': 'D1234',
        'name': 'Friends of McPersonson',
        'designation_full': 'Authorized',
        'designation_code': 'PC' 
    },
    'affiliated_committees': {
        'D1234': {
            'id': 'D1234',
            'name': 'Friends of McPersonson',
            'designation_full': 'Authorized',
            'designation_code': 'A' 
        }
    }
}

committee = {
    'description': {
        'name': 'Friends of McPersonson',
        'organization_type_full': 'Secret Club'
    },
    'treasurer': {
        'name_full': 'Money McMaster'
    },
    'address': {
        'street_1': '123 Boulevard St.',
        'street_2': '#595',
        'city': 'Placetown',
        'state': 'KY',
        'zip': '23456'
    },
    'status': {
        'type_full': 'Partay',
        'designation_full': 'Very Authorized'
    },
    'committee_id': 'B7890'
}

totals = {
    'results': [{
        'reports': [{
            'cash_on_hand_end_period': 123.34,
            'debts_owed_by_committee': 45678.90,
            'report_year': 2010,
            'election_cycle': 2010,
            'report_type_full': 'End Report {stuff}'
        }],
        'totals': [{
            'receipts': 231.45,
            'disbursements': 3453.54
        }],
        'committee_id': 'D1234'
    },
    {
        'reports': [{
            'cash_on_hand_end_period': 0,
            'debts_owed_by_committee': 0,
            'report_year': 2010,
            'election_cycle': 2010,
            'report_type_full': 'End Report {stuff}'
        }],
        'totals': [{
            'receipts': 0,
            'disbursements': 0
        }],
        'committee_id': 'D1234'
    }]
}

early_ac = [
    {
        'committee_id': 'D1234',
        'committee_name': 'Friends of McPersonson',
        'designation_full': 'Authorized',
        'designation_code': 'A' 

    }
]

late_ac = {
    'D1234': {
        'committee_id': 'D1234',
        'committee_name': 'Friends of McPersonson',
        'designation_full': 'Authorized',
        'designation_code': 'A' 
    }
}

