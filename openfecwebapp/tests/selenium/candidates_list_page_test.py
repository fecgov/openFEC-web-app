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

    def testCandidatesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse candidate records')

    def testCandidatesFilterSideBar(self):
        self.driver.get(self.url)
        #self.driver.find_element_by_class_name('side-toggle').click()
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
        self.driver.get(self.url)
        self.openFilters()
        cycle = self.getFilterDivByName('year')
        time.sleep(1)
        cycle.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            cycle.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        cycle.find_element_by_tag_name('input').send_keys('201')
        self.assertEqual(
            len(cycle.find_elements_by_tag_name('li')),
            5)
        cycle.find_element_by_tag_name('input').send_keys('4')
        cycle.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            cycle.get_attribute('class'),
            'field active')
        cycle.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        results = (self.driver.find_elements_by_tag_name('tr'))
        yrs = [y.find_elements_by_tag_name('td')[2].text for y in results[1:]]
        self.assertEqual(
            set(yrs),
            {'2014'})

    def testCandidatePartyFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        party = self.getFilterDivByName('party')
        time.sleep(1)
        party.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            party.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        party.find_element_by_tag_name('input').send_keys('demo')
        self.assertEqual(
            len(party.find_elements_by_tag_name('li')),
            5)
        party.find_element_by_tag_name('input').send_keys('cratic party')
        party.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        party.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        results = (self.driver.find_elements_by_tag_name('tr'))
        ptys = [p.find_elements_by_tag_name('td')[3].text for p in results[1:]]
        self.assertEqual(
            set(ptys),
            {'Democratic Party'})

    def testCandidateStateFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        state = self.getFilterDivByName('state')
        time.sleep(1)
        state.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            state.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        state.find_element_by_tag_name('input').send_keys('W')
        self.assertEqual(
            len(state.find_elements_by_tag_name('li')),
            4)
        state.find_element_by_tag_name('input').send_keys('est')
        state.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        state.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        results = (self.driver.find_elements_by_tag_name('tr'))
        sts = [p.find_elements_by_tag_name('td')[4].text for p in results[1:]]
        self.assertEqual(
            set(sts),
            {'WV'})

    def testCandidateDistrictFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        district = self.getFilterDivByName('district')
        time.sleep(1)
        district.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            district.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        district.find_element_by_tag_name('input').send_keys('1')
        self.assertEqual(
            len(district.find_elements_by_tag_name('li')),
            10)
        district.find_element_by_tag_name('input').send_keys('0')
        district.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        district.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        results = (self.driver.find_elements_by_tag_name('tr'))
        dsts = [p.find_elements_by_tag_name('td')[5].text for p in results[1:]]
        self.assertEqual(
            set(dsts),
            {'10'})

    def testCandidateOfficeFilter(self):
        self.driver.get(self.url)
        self.openFilters()
        office = self.getFilterDivByName('office')
        time.sleep(1)
        office.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            office.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        office.find_element_by_tag_name('input').send_keys('P')
        self.assertEqual(
            len(office.find_elements_by_tag_name('li')),
            1)
        office.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        office.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        results = (self.driver.find_elements_by_tag_name('tr'))
        ofcs = [p.find_elements_by_tag_name('td')[1].text for p in results[1:]]
        self.assertEqual(
            set(ofcs),
            {'President'})

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
