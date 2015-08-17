import re

import furl

from .base_test_class import SearchPageTestCase

from tests.selenium import utils


candidate_url_re = re.compile('\/candidate\/\w+$')
committee_url_re = re.compile('\/committee\/\w+$')


class SearchResultsPageTests(SearchPageTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.driver.get(cls.base_url + '/candidates')
        utils.wait_for_event(cls.driver, 'draw.dt', 'draw')
        cls.candidate = cls.driver.find_element_by_css_selector(
            'a[data-category="candidate"]'
        ).text

        cls.driver.get(cls.base_url + '/committees')
        utils.wait_for_event(cls.driver, 'draw.dt', 'draw')
        cls.committee = cls.driver.find_element_by_css_selector(
            'a[data-category="committee"]'
        ).text

    def setUp(self):
        self.url = furl.furl(self.base_url)

    def test_search_results_page_load(self):
        self.url.args.update({'search': self.candidate})
        self.driver.get(self.url.url)
        self.assertIn('Search results', self.driver.title)

    def test_search_results_page_type(self):
        self.url.args.update({'search': self.candidate, 'search_type': 'candidates'})
        self.driver.get(self.url.url)
        self.assertIn('Search results', self.driver.title)

    def test_search_results_page_link_candidates(self):
        self.url.args.update({'search': self.candidate, 'search_type': 'candidates'})
        self.driver.get(self.url.url)
        elms = self.driver.find_elements_by_css_selector('.tst-search_results h3 a')
        self.assertTrue(elms)
        self.assertTrue(all([
            candidate_url_re.search(elm.get_attribute('href'))
            for elm in elms
        ]))

    def test_search_results_page_link_committees(self):
        self.url.args.update({'search': self.committee, 'search_type': 'committees'})
        self.driver.get(self.url.url)
        elms = self.driver.find_elements_by_css_selector('.tst-search_results h5 a')
        self.assertTrue(elms)
        self.assertTrue(all([
            committee_url_re.search(elm.get_attribute('href'))
            for elm in elms
        ]))
