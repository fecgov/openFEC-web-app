from selenium import webdriver
import unittest

BASE_URL = 'http://localhost:3000'


class ErrorPageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()

    def testErrorPageLoads(self):
        self.driver.get(BASE_URL + '/INVALIDURL')
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Not Found')

    def testErrorPageSearch(self):
        self.driver.get(BASE_URL + '/INVALIDURL')
        main = self.driver.find_element_by_tag_name('main')
        main.find_element_by_class_name('search-bar').send_keys('obama')
        main.find_element_by_class_name('search-submit').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h2').text,
            'Search results obama')

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
