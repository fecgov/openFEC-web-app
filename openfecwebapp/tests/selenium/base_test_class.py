import os
import unittest

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from nose.plugins.attrib import attr


drivers = {
    'phantomjs': lambda: webdriver.PhantomJS(service_args=['--ignore-ssl-errors=true']),
    'firefox': lambda: webdriver.Firefox(),
    'chrome': lambda: webdriver.Chrome(),
}


@attr('selenium')
class BaseTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.driver = drivers[os.getenv('FEC_SELENIUM_DRIVER', 'phantomjs')]()
        cls.driver.set_window_size(2000, 2000)
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

    def elementExistsByXPath(self, xpath):
        try:
            self.driver.find_element_by_xpath(xpath)
        except NoSuchElementException:
            return False
        return True
