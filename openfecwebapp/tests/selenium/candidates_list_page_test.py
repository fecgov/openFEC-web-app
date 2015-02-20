from selenium import webdriver
import unittest

BASE_URL = 'http://localhost:3000'


class CandidatesPageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()

    def testCandidatesPageLoads(self):
        self.driver.get(BASE_URL + '/candidates')
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse candidate records')

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
