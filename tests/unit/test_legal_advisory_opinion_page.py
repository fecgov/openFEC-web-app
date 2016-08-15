from unittest import mock, TestCase
from urllib.parse import urlparse, parse_qs

import flask

from tests import factory
from openfecwebapp import api_caller
from openfecwebapp.app import app


class TestLoadAdvisoryOpinion(TestCase):

    def setUp(self):
        self.app = app.test_client()

    @mock.patch.object(api_caller, '_call_api')
    def test_load_advisory_opinion(self, call_api):
        final_opinion = factory.advisory_opinion(category='Final Opinion')
        call_api.return_value = {
            'docs': [
                factory.advisory_opinion(category='Draft'),
                final_opinion,
                factory.advisory_opinion(category='Votes'),
            ]
        }

        canonical_document = api_caller.load_legal_advisory_opinion('2014-01')
        self.assertEqual(canonical_document.get('no'), '2014-01')
        self.assertEqual(canonical_document.get('category'), 'Final Opinion')
        self.assertEqual(canonical_document.get('name'), final_opinion.get('name'))
        self.assertEqual(canonical_document.get('summary'), final_opinion.get('summary'))
        self.assertEqual(canonical_document.get('description'), final_opinion.get('description'))
        self.assertEqual(canonical_document.get('url'), final_opinion.get('url'))
        self.assertEqual(len(canonical_document.get('documents')), 3)

    @mock.patch.object(api_caller, '_call_api')
    def test_given_no_final_opinion(self, call_api):
        call_api.return_value = {
            'docs': [
                factory.advisory_opinion(category='Draft'),
                factory.advisory_opinion(category='Votes'),
            ]
        }

        canonical_document = api_caller.load_legal_advisory_opinion('2014-01')
        self.assertEqual(canonical_document.get('no'), '2014-01')
        self.assertNotEqual(canonical_document.get('category'), 'Final Opinion')
        self.assertEqual(len(canonical_document.get('documents')), 2)
