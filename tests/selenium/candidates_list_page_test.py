import unittest
import functools

from selenium.webdriver.common.keys import Keys
from .base_test_class import SearchPageTestCase


class CandidatesPageTests(SearchPageTestCase):

    def setUp(self):
        self.url = self.base_url + '/candidates'

    def testCandidatesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Candidates')

    def testCandidatesFilterSideBar(self):
        self.driver.get(self.url)
        filters = self.driver.find_element_by_id('filters')
        self.assertIn('side-panel--open', filters.get_attribute('class'))

    @unittest.skip('Will fail unless we ensure that subset data includes Mark Alliegro')
    def testCandidateNameFilter(self):
        self.driver.get(self.url)
        name_div = self.getFilterDivByName('name')
        name_div.find_element_by_tag_name('input').send_keys('Alliegro')
        self.driver.find_element_by_id('category-filters').submit()
        self.assertEqual(
            len(self.driver.find_element_by_tag_name('tbody')
                .find_elements_by_tag_name('tr')),
            1)
        self.assertEqual(
            self.driver.find_element_by_class_name('single-link').text,
            'ALLIEGRO, MARK C')

    def testCandidateCycleFilter(self):
        def checker(entry, result):
            parts = [int(part) for part in result.split(' - ')]
            if len(parts) == 1:
                return parts[0] in [entry, entry + 1]
            if len(parts) == 2:
                lower, upper = parts
                return (lower <= entry <= upper) or (lower <= entry + 1 <= upper)
            return False
        self.checkFilter('cycle', '2013', 2, functools.partial(checker, 2013))

    def testCandidatePartyFilter(self):
        self.checkFilter(
            'party', 'republican party', 3, 'Republican Party')

    def testCandidateStateFilter(self):
        self.checkFilter('state', 'penn', 4, 'PA')

    def testCandidateDistrictFilter(self):
        self.checkFilter('district', '10', 5, '10')

    def testCandidateOfficeFilter(self):
        self.checkFilter('office', 'P', 1, 'President')
