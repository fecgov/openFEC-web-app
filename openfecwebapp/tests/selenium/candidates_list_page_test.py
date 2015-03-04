from .base_test_class import BaseTest
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time


class CandidatesPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidates'

    def getFilterDivByName(self, name):
        return self.driver.find_element_by_xpath('//*[@for="' + name + '"]/..')

    def openFilters(self):
        self.driver.find_element_by_class_name('side-toggle').click()

    def getColumn(self, index, data):
        return [row.find_elements_by_tag_name('td')[index].text
                for row in data.find_elements_by_tag_name('tr')]

    def checkFilter(self, name, first_entry, second_entry,
                    count, index, result):
        self.driver.get(self.url)
        self.openFilters()
        div = self.getFilterDivByName(name)
        time.sleep(1)
        div.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            div.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        div.find_element_by_tag_name('input').send_keys(first_entry)
        self.assertEqual(
            len(div.find_elements_by_tag_name('li')),
            count)
        div.find_element_by_tag_name('input').send_keys(second_entry)
        div.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            div.get_attribute('class'),
            'field active')
        div.find_element_by_tag_name('input').send_keys(Keys.ENTER)
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
        self.openFilters()
        main = self.getMain()
        self.assertEqual(main.get_attribute('class'), 'side--open')

    def testCandidateNameFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        name_div = self.getFilterDivByName('name')
        time.sleep(1)
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
