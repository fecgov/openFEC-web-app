from selenium.webdriver.common.keys import Keys
from .base_test_class import SearchPageTestCase


class CommitteesPageTests(SearchPageTestCase):

    def setUp(self):
        self.url = self.base_url + '/committees'

    def testCommitteesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse committee records')

    def testCommitteeSorting(self):
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

    def testCommitteesFilterSideBar(self):
        self.driver.get(self.url)
        self.openFilters()
        filters = self.driver.find_element_by_id('filters')
        self.assertIn('side-panel--open', filters.get_attribute('class'))

    def testCommitteeNameFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        name_div = self.getFilterDivByName('name')
        name_div.find_element_by_tag_name('input').send_keys('pork')
        name_div.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            len(self.driver.find_element_by_tag_name('tbody')
                .find_elements_by_tag_name('tr')),
            1)
        self.assertIn(
            'PORK',
            self.driver.find_element_by_class_name('single-link').text)

    def testCommitteePartyFilter(self):
        self.checkFilter(
            'party', 'demo', 'cratic party', 5, 3, 'Democratic Party')

    def testCommitteeStateFilter(self):
        self.checkFilter('state', 'o', 'regon', 4, 2, 'OR')

    def testCommitteeTypeFilter(self):
        self.checkFilter('committee_type', 'p', 'r', 9, 5, 'Presidential')

    def testCommitteeDesignationFilter(self):
        self.checkFilter(
            'designation', 'a', '', 1, 6, 'Authorized by a candidate')

    def testCommitteeOrgTypeFilter(self):
        self.checkFilter('organization_type', 'c', 'orp', 3, 4, 'Corporation')
