from .base_test_class import BaseTest


class LandingPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url

    def testLandingPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Discover FEC Data Easier Than Ever')

    def testHeaderSearch(self):
        self.driver.get(self.url)
        header = self.getHeader()
        header.find_element_by_class_name('search-bar').send_keys('obama')
        header.find_element_by_class_name('search-submit').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h2').text,
            'Search results obama')

    def testMainSearch(self):
        self.driver.get(self.url)
        main = self.getMain()
        main.find_element_by_class_name('search-bar').send_keys('obama')
        main.find_element_by_id('submit-search').click()
        self.assertEqual(
            self.driver.find_element_by_tag_name('h2').text,
            'Search results obama')
