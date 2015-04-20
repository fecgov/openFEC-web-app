import os
import unittest

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from nose.plugins.attrib import attr


sauce_url = 'http://{0}:{1}@ondemand.saucelabs.com:80/wd/hub'.format(
    os.getenv('SAUCE_USERNAME'),
    os.getenv('SAUCE_ACCESS_KEY'),
)


drivers = {
    'chrome': lambda cls: webdriver.Chrome(),
    'firefox': lambda cls: webdriver.Firefox(),
    'phantomjs': lambda cls: webdriver.PhantomJS(
        service_args=['--ignore-ssl-errors=true'],
    ),
    'remote': lambda cls: webdriver.Remote(
        desired_capabilities={
            'name': cls.__name__,
            'build': os.getenv('TRAVIS_BUILD_NUMBER'),
            'tunnel-identifier': os.getenv('TRAVIS_JOB_NUMBER'),
            'platform': os.getenv('FEC_SAUCE_PLATFORM', 'Mac OS X 10.9'),
            'browserName': os.getenv('FEC_SAUCE_BROWSER', 'chrome'),
            'version': os.getenv('FEC_SAUCE_VERSION', ''),
        },
        command_executor=sauce_url,
    ),
}


@attr('selenium')
class BaseTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.driver = drivers[os.getenv('FEC_SELENIUM_DRIVER', 'phantomjs')](cls)
        cls.driver.set_window_size(2000, 2000)
        cls.driver.implicitly_wait(30)
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
