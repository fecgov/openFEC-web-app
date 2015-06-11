import os
import time
import logging
import unittest

import pytest
from nose.plugins.attrib import attr

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException

from openfecwebapp.sauce import SauceClient


# Silence Selenium logs
remote_logger = logging.getLogger('selenium.webdriver.remote.remote_connection')
remote_logger.setLevel(logging.WARN)


sauce_url = 'http://{0}:{1}@ondemand.saucelabs.com:80/wd/hub'.format(
    os.getenv('SAUCE_USERNAME'),
    os.getenv('SAUCE_ACCESS_KEY'),
)

sauce_client = SauceClient(
    username=os.getenv('SAUCE_USERNAME'),
    access_key=os.getenv('SAUCE_ACCESS_KEY'),
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


def wait_for_ajax(driver, timeout=10, interval=0.1):
    elapsed = 0
    while True:
        active = driver.execute_script('return $.active === 0')
        if active or elapsed > timeout:
            break
        time.sleep(interval)
        elapsed += interval


@attr('selenium')
@pytest.mark.selenium
class BaseTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        driver = os.getenv('FEC_SELENIUM_DRIVER', 'phantomjs')
        cls.driver = drivers[driver](cls)
        cls.driver.maximize_window()
        cls.driver.implicitly_wait(5)
        cls.base_url = 'http://localhost:3000'

    @classmethod
    def tearDownClass(cls):
        # Log suite status to Sauce if using remote tests
        if os.getenv('FEC_SELENIUM_DRIVER', '') == 'remote':
            failed = getattr(cls, '_fail', False)
            sauce_client.update_job(cls.driver.session_id, passed=not failed)
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


class SearchPageTestCase(BaseTest):

    def getFilterDivByName(self, name):
        return self.driver.find_element_by_xpath('//*[@for="' + name + '"]/..')

    def openFilters(self):
        self.driver.find_element_by_id('filter-toggle').click()

    def getColumn(self, index, data):
        return [row.find_elements_by_tag_name('td')[index].text
                for row in data.find_elements_by_tag_name('tr')]

    def checkFilter(self, name, entry, index, result, refresh=True, click=False):
        if refresh:
            self.driver.get(self.url)

        div = self.getFilterDivByName(name)
        select = div.find_element_by_tag_name('select')
        # Hack: In some cases, `send_keys` will fail with Chrome; allow clicking on <option> directly
        # TODO(jmcarp): Replace with a cleaner solution
        if click:
            select.find_element_by_css_selector('[value=' + result + ']').click()
        else:
            select.send_keys(entry)
        select.send_keys(Keys.ENTER)
        # Refresh containing div to avoid stale reference error
        div = self.getFilterDivByName(name)
        close_buttons = div.find_elements_by_xpath(
            './/button[contains(@class, "button--remove")]'
        )
        self.assertEqual(len(close_buttons), 1)
        self.driver.find_element_by_id('category-filters').submit()
        self.check_filter_results(index, result)

    def check_filter_results(self, index, result):
        wait_for_ajax(self.driver)
        values = [
            row.find_elements_by_tag_name('td')[index].text
            for row in self.driver.find_elements_by_css_selector('tbody tr')
        ]
        if callable(result):
            for value in values:
                self.assertTrue(result(value))
        else:
            self.assertFalse({result}.difference(values))
