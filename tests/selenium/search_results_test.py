import re

import furl

from .base_test_class import SearchPageTestCase


candidate_url_re = re.compile('\/candidate\/\w+$')
committee_url_re = re.compile('\/committee\/\w+$')


class SearchResultsPageTests(SearchPageTestCase):

    def setUp(self):
        self.url = furl.furl(self.base_url)

    def test_search_results_page_load(self):
        self.url.args.update({'search': 'boehner'})
        self.driver.get(self.url.url)
        self.assertIn('Search results', self.driver.title)

    def test_search_results_page_type(self):
        self.url.args.update({'search': 'boehner', 'search_type': 'candidates'})
        self.driver.get(self.url.url)
        self.assertIn('Search results', self.driver.title)

    def test_search_results_page_link_candidates(self):
        self.url.args.update({'search': 'boehner', 'search_type': 'candidates'})
        self.driver.get(self.url.url)
        elms = self.driver.find_elements_by_css_selector('.tst-search_results h3 a')
        self.assertTrue(elms)
        self.assertTrue(all([
            candidate_url_re.search(elm.get_attribute('href'))
            for elm in elms
        ]))

    def test_search_results_page_link_committees(self):
        self.url.args.update({'search': 'grijalva', 'search_type': 'committees'})
        self.driver.get(self.url.url)
        elms = self.driver.find_elements_by_css_selector('.tst-search_results h5 a')
        self.assertTrue(elms)
        self.assertTrue(all([
            committee_url_re.search(elm.get_attribute('href'))
            for elm in elms
        ]))
