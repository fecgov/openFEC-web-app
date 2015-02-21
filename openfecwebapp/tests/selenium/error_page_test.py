from .base_test_class import BaseTest


class ErrorPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/INVALIDURL'

    def testErrorPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Not Found')

    def testErrorPageSearch(self):
        self.driver.get(self.url)
        main = self.driver.find_element_by_tag_name('main')
        main.find_element_by_class_name('search-bar').send_keys('obama')
        main.find_element_by_class_name('search-submit').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h2').text,
            'Search results obama')
