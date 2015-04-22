from selenium.webdriver.common.keys import Keys
from .base_test_class import SearchPageTestCase


class CandidatesPageTests(SearchPageTestCase):

    def setUp(self):
        self.url = self.base_url + '/candidates'

    def testCandidatesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse candidate records')

    def testCandidateSorting(self):
        self.driver.get(self.url)
        table = self.driver.find_element_by_tag_name('table')
        headers = (table.find_element_by_tag_name('thead')
                   .find_elements_by_tag_name('th'))
        data = table.find_element_by_tag_name('tbody')
        for i in range(len(headers)):
            headers[i].click()
            self.assertEqual(
                sorted(self.getColumn(i, data), reverse=True),
                self.getColumn(i, data))

    def testCandidatesFilterSideBar(self):
        self.driver.get(self.url)
        self.openFilters()
        filters = self.driver.find_element_by_id('filters')
        self.assertIn('side-panel--open', filters.get_attribute('class'))

    def testCandidateNameFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        name_div = self.getFilterDivByName('name')
        name_div.find_element_by_tag_name('input').send_keys('Alliegro')
        name_div.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            len(self.driver.find_element_by_tag_name('tbody')
                .find_elements_by_tag_name('tr')),
            1)
        self.assertEqual(
            self.driver.find_element_by_class_name('single-link').text,
            'ALLIEGRO, MARK C')

    def testCandidateCycleFilter(self):
        self.checkFilter('year', '201', '4', 5, 2, '2014')

    def testCandidatePartyFilter(self):
        self.checkFilter(
            'party', 'demo', 'cratic party', 5, 3, 'Democratic Party')

    def testCandidateStateFilter(self):
        self.checkFilter('state', 'w', 'est', 4, 4, 'WV')

    def testCandidateDistrictFilter(self):
        self.checkFilter('district', '1', '0', 10, 5, '10')

    def testCandidateOfficeFilter(self):
        self.checkFilter('office', 'P', '', 1, 1, 'President')
