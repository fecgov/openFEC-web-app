from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import unittest
import os
from nose.plugins.attrib import attr


@attr('selenium')
class BaseTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.user = os.environ.get('FEC_WEB_USERNAME')
        cls.pw = os.environ.get('FEC_WEB_PASSWORD')
        if not cls.user or not cls.pw:
            raise ValueError('Could not find username or password. '
                             'Did you remember to source env variables?')
        cls.driver = webdriver.PhantomJS()
        cls.driver.set_window_size(1600, 550)
        cls.base_url = 'http://' + cls.user + ':' + cls.pw + '@localhost:3000'

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

    def elementExistsByXPath(self, xpath):
        try:
            self.driver.find_element_by_xpath(xpath)
        except NoSuchElementException:
            return False
        return True
