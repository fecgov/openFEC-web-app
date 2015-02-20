from selenium import webdriver
import unittest

BASE_URL = 'http://localhost:3000'


class CommitteesPageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()

    def testCommitteesPageLoads(self):
        self.driver.get(BASE_URL + '/committees')
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse committee records')

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
