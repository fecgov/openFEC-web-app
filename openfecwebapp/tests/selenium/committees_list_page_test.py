from .base_test_class import BaseTest
from selenium.webdriver.common.keys import Keys
import time


class CommitteesPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/committees'

    def getFilterDivByName(self, name):
        return self.driver.find_element_by_xpath('//*[@for="' + name + '"]/..')

    def openFilters(self):
        self.driver.find_element_by_id('filter-toggle').click()

    def getColumn(self, index, data):
        return [row.find_elements_by_tag_name('td')[index].text
                for row in data.find_elements_by_tag_name('tr')]

    def checkFilter(self, name, first_entry, second_entry,
                    count, index, result):
        self.driver.get(self.url)
        self.openFilters()
        cycle = self.getFilterDivByName(name)
        time.sleep(1)
        cycle.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            cycle.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        cycle.find_element_by_tag_name('input').send_keys(first_entry)
        self.assertEqual(
            len(cycle.find_elements_by_tag_name('li')),
            count)
        cycle.find_element_by_tag_name('input').send_keys(second_entry)
        cycle.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            cycle.get_attribute('class'),
            'field active')
        cycle.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        results = (self.driver.find_elements_by_tag_name('tr'))
        col = [y.find_elements_by_tag_name('td')[index]
                .text for y in results[1:]]
        self.assertEqual(
            set(col),
            {result})

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
        # main = self.getMain()
        # self.assertEqual(main.get_attribute('class'), 'side--open')
        filters = self.driver.find_element_by_id('filters')
        self.assertEqual(filters.get_attribute('class'),
                         'side-panel side-panel--left side-panel--open')

    def testCommitteeNameFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        name_div = self.getFilterDivByName('name')
        time.sleep(1)
        name_div.find_element_by_tag_name('input').send_keys('pork')
        name_div.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            len(self.driver.find_element_by_tag_name('tbody')
                .find_elements_by_tag_name('tr')),
            1)
        self.assertEqual(
            self.driver.find_element_by_class_name('single-link').text,
            ('NATIONAL PORK PRODUCERS COUNCIL PORK PAC'))

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
