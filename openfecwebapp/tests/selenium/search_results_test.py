import unittest
import urllib

from .base_test_class import SearchPageTestCase

class SearchResultsPageTests(SearchPageTestCase):

    def setUp(self):
        self.url = self.base_url + '/?search='

    def testSearchResultsPageLoad(self):
        self.driver.get(self.url + 'obama')
        self.assertIn('Search results', self.driver.title)

    def testSearchResultsPageShowsQuery(self):
      expected = 'obama'
      self.driver.get(self.url + expected)
      self.assertIn(expected, self.driver.title)
      self.assertIn(
          expected,
          self.driver.find_element_by_class_name('tst-search_results').text
          )

    def testSearchResultsPageType(self):
      test_query = 'obama'
      expected = 'candidates'
      self.driver.get('/?' + urllib.parse.urlencode(
        {'search': test_query, 'search_type': expected}))
      self.assertIn('Search results', self.driver.title)

    def testSearchResultsPageLinkOnType(self):
      test_query = 'obama'
      expected = 'candidates'
      self.driver.get('/?' + urllib.parse.urlencode(
        {'search': test_query, 'search_type': expected}))
      self.assertIsNotNone(self.driver.find_elements_by_link_text(
        'View Candidate Page'))

    def testSearchResultsPageLinkOnCommittee(self):
      test_query = 'obama'
      expected = 'committees'
      self.driver.get('/?' + urllib.parse.urlencode(
        {'search': test_query, 'search_type': expected}))
      self.assertIsNotNone(self.driver.find_elements_by_link_text(
        'View Committee Page'))

    def testSearchResultsPageLoadsOneResult(self):
      test_query = 'obama'
      test_type = 'candidates'
      self.driver.get('/?' + urllib.parse.urlencode(
        {'search': test_query, 'search_type': test_type}))
      self.elementExistsByClassName('tst-search_result')

    def testSearchResultsPageLoadsOneResultCommittee(self):
      test_query = 'obama'
      test_type = 'committees'
      self.driver.get('/?' + urllib.parse.urlencode(
        {'search': test_query, 'search_type': test_type}))
      self.elementExistsByClassName('tst-search_result')

