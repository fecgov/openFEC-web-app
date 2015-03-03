from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import unittest
from nose.plugins.attrib import attr


@attr('selenium')
class BaseTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()
        #cls.driver.set_window_size(1600, 550)
        cls.base_url = 'http://localhost:3000'

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def getHeader(self):
        return self.driver.find_element_by_class_name('site-header')

    def getMain(self):
        return self.driver.find_element_by_tag_name('main')

    def elementExistsByClassName(self, name):
        try:
            self.driver.find_element_by_class_name(name)
        except NoSuchElementException:
            return False
        return True
