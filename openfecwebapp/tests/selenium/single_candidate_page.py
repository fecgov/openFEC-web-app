from selenium import webdriver
import unittest

BASE_URL = 'http://localhost:3000'


class SingleCandidatePageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()

    def testSingleCandidatePageLoads(self):
        self.driver.get(BASE_URL + '/committees/C00315176')
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'FEINSTEIN FOR SENATE')

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
