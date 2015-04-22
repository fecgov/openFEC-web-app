import os
import unittest

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
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


class SearchPageTestCase(BaseTest):

    def getFilterDivByName(self, name):
        return self.driver.find_element_by_xpath('//*[@for="' + name + '"]/..')

    def openFilters(self):
        self.driver.find_element_by_id('filter-toggle').click()

    def getColumn(self, index, data):
        return [row.find_elements_by_tag_name('td')[index].text
                for row in data.find_elements_by_tag_name('tr')]

    def checkFilter(self, name, first_entry, second_entry,
                    count, index, result):
        self.driver.get(self.url)
        self.openFilters()
        div = self.getFilterDivByName(name)
        # Hack: Scroll to expand button before clicking; otherwise expand fails
        # in Chrome and breaks tests
        self.driver.execute_script('''
            $('body').animate({
                scrollTop: $('[for="%s"]').offset().top
            }, 0);
        ''' % (name, ))
        div.find_element_by_xpath('./div/a/div/b').click()
        self.assertEqual(
            div.find_element_by_xpath('./div').get_attribute('class'),
            ('chosen-container chosen-container-single '
             'chosen-with-drop chosen-container-active'))
        div.find_element_by_tag_name('input').send_keys(first_entry)
        self.assertEqual(
            len(div.find_elements_by_tag_name('li')),
            count)
        div.find_element_by_tag_name('input').send_keys(second_entry)
        div.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            div.get_attribute('class'),
            'field active')
        self.driver.find_element_by_id('category-filters').submit()
        results = (self.driver.find_elements_by_tag_name('tr'))
        col = [y.find_elements_by_tag_name('td')[index]
                .text for y in results[1:]]
        self.assertEqual(
            set(col),
            {result})
