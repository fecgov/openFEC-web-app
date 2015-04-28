from .base_test_class import BaseTest
from selenium.webdriver.common.keys import Keys
import time


class CandidatesPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidates'

    def getFilterDivByName(self, name):
        return self.driver.find_element_by_xpath('//*[@for="' + name + '"]/..')

    def getColumn(self, index, data):
        return [row.find_elements_by_tag_name('td')[index].text
                for row in data.find_elements_by_tag_name('tr')]

    def checkFilter(self, name, first_entry, second_entry,
                    count, index, result):
        self.driver.get(self.url)
        div = self.getFilterDivByName(name)
        div.find_element_by_tag_name('select').send_keys(first_entry)
        div.find_element_by_tag_name('select').send_keys(second_entry)
        div.find_element_by_tag_name('select').send_keys(Keys.ENTER)
        close_buttons = div.find_elements_by_xpath(
            './/button[contains(@class, "button--remove")]'
        )
        self.assertEqual(len(close_buttons), 1)
        self.driver.find_element_by_id('category-filters').submit()
        results = (self.driver.find_elements_by_tag_name('tr'))
        col = [y.find_elements_by_tag_name('td')[index]
                .text for y in results[1:]]
        self.assertEqual(
            set(col),
            {result})

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
        filters = self.driver.find_element_by_id('filters')
        self.assertIn('side-panel--open', filters.get_attribute('class'))

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
