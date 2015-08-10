import os
import logging
import unittest

import pytest
from nose.plugins.attrib import attr

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import StaleElementReferenceException

from openfecwebapp.sauce import SauceClient

from tests.selenium import utils


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

    def check_filter(self, name, value, column, result, refresh=True, expand=True):
        if refresh:
            self.driver.get(self.url)
        self.click_filter(name, value, expand=expand)
        self.check_filter_results(column, result)

    def click_filter(self, name, value, expand=True):
        div = self.driver.find_element_by_xpath(''.join([
            '//*[@name="' + name + '"]',
            '/ancestor::div[@class="field"]',
        ]))
        checkbox = div.find_element_by_css_selector(
            'input[type="checkbox"][value="' + value + '"]'
        )
        # Ensure performance bar doesn't block clicks
        self.driver.execute_script('$(".perfBar-bar").hide()')
        if expand:
            try:
                button = div.find_element_by_css_selector('button.js-toggle')
            except NoSuchElementException:
                button = None
            if button:
                utils.try_until(lambda: button.click())
        # Handle probabilistic checkbox click failures in Chrome
        checked = bool(checkbox.get_attribute('checked'))
        utils.try_until(
            lambda: checkbox.click(),
            condition=lambda: bool(checkbox.get_attribute('checked')) != checked,
        )

    def check_filter_results(self, index, result):
        utils.wait_for_event(self.driver, 'draw.dt', 'draw')
        # Handle stale reference errors in Chrome
        get_values = lambda: [
            row.find_elements_by_tag_name('td')[index].text
            for row in self.driver.find_elements_by_css_selector('tbody tr')
        ]
        values = utils.try_until(get_values, errors=(StaleElementReferenceException, ))
        if callable(result):
            for value in values:
                self.assertTrue(result(value))
        else:
            result = set([result]) if not isinstance(result, set) else result
            self.assertEqual(result, set(values))
