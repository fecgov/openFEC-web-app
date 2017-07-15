import unittest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

BASE_URL = 'http://localhost:3000'

class TestDataLanding(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get(BASE_URL)

    def test_title(self):
        self.assertEqual(self.driver.title, 'Campaign finance data | FEC')

    def test_page_load(self):
        # The charts load
        charts = WebDriverWait(self.driver, 30).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, '.js-chart svg')))
        self.assertEqual(len(charts), 2)

        # The top lists load
        top_candidates = self.driver.find_elements_by_css_selector('#candidates-top-raising li')
        self.assertEqual(len(top_candidates), 5)

        top_pacs = self.driver.find_elements_by_css_selector('#pacs-top-raising li')
        self.assertEqual(len(top_candidates), 5)

        top_parties = self.driver.find_elements_by_css_selector('#parties-top-raising li')
        self.assertEqual(len(top_candidates), 5)



    def tearDown(self):
        self.driver.quit()

class TestSearch(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get(BASE_URL)

    def test_search_submit(self):
        search = self.driver.find_element_by_css_selector('#search')
        search.send_keys('obama')
        search.submit()

        # The search results load
        self.assertEqual(self.driver.title, 'Search results | FEC')

        # There are 5 results for each
        candidate_results = self.driver.find_elements_by_css_selector('#candidates li')
        self.assertEqual(len(candidate_results), 5)
        committee_results = self.driver.find_elements_by_css_selector('#committees li')
        self.assertEqual(len(candidate_results), 5)

        # The search form is populated
        self.assertEqual(self.driver.find_element_by_css_selector('#search').get_attribute('value'), 'obama')

    def tearDown(self):
        self.driver.quit()
