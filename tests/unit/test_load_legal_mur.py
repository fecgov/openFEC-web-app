from collections import OrderedDict
import mock

from openfecwebapp import api_caller

@mock.patch.object(api_caller, '_call_api')
def test_load_legal_mur(call_api):
    call_api.return_value = {
        'docs': [{
            'no': '1234',
            'mur_type': 'current',
            'participants': [
                {
                    'role': 'Complainant',
                    'name': 'Gollum',
                    'citations': []
                },
                {
                    'role': 'Respondent',
                    'name': 'Bilbo Baggins',
                    'citations': []
                },
            ],
            'disposition': {
                'text': '',
                'data': [
                    {
                        'disposition': 'Conciliation-PC',
                        'penalty': 100.0
                    },
                    {
                        'disposition': 'Conciliation-PC',
                        'penalty': 0.0
                    },
                ]
            },
            'documents': []
        }]
    }

    mur = api_caller.load_legal_mur('1234')

    assert mur.get('no') == '1234'
    assert mur['participants_by_type'] == OrderedDict([
        ('Respondent', ['Bilbo Baggins']),
        ('Complainant', ['Gollum']),
    ])
    assert mur['disposition_data'] == OrderedDict([
        ('Conciliation-PC', OrderedDict([
            (100.0, [{'penalty': 100.0, 'disposition': 'Conciliation-PC'}]),
            (0.0, [{'penalty': 0.0, 'disposition': 'Conciliation-PC'}])
        ]))
    ])
