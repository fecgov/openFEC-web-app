from selenium.webdriver.common.keys import Keys

from .base_test_class import BaseTest


class ErrorPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/INVALIDURL'

    def testErrorPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Oops!')

    def testErrorPageSearch(self):
        self.driver.get(self.url)
        main = self.driver.find_element_by_tag_name('main')
        field = main.find_element_by_class_name('js-search-input')
        field.send_keys('obama')
        field.send_keys(Keys.ENTER)

        self.elementExistsByClassName('tst-search_results')
