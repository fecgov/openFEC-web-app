from selenium import webdriver
import unittest

BASE_URL = 'http://localhost:3000'


class LandingPageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()

    def getHeader(self):
        return self.driver.find_element_by_class_name('site-header')

    def getMain(self):
        return self.driver.find_element_by_tag_name('main')

    def testLandingPageLoads(self):
        self.driver.get(BASE_URL)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Explore campaign finance data')

    def testHeaderLinks(self):
        self.driver.get(BASE_URL)
        header = self.getHeader()
        header.find_element_by_name('candidates').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse candidate records')
        self.driver.back()
        header = self.getHeader()
        header.find_element_by_name('committees').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse committee records')
        header = self.getHeader()
        header.find_element_by_class_name('header-nav__brand').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Explore campaign finance data')
        header = self.getHeader()

    def testHeaderSearch(self):
        self.driver.get(BASE_URL)
        header = self.getHeader()
        header.find_element_by_class_name('search-bar').send_keys('obama')
        header.find_element_by_class_name('search-submit').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h2').text,
            'Search results obama')

    def testMainSearch(self):
        self.driver.get(BASE_URL)
        main = self.getMain()
        main.find_element_by_class_name('search-bar').send_keys('obama')
        main.find_element_by_id('submit-search').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h2').text,
            'Search results obama')

    def testMainLinks(self):
        self.driver.get(BASE_URL)
        main = self.getMain()
        main.find_element_by_name('candidates').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse candidate records')
        self.driver.back()
        main = self.getMain()
        main.find_element_by_name('committees').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse committee records')

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
