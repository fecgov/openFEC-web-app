from .base_test_class import BaseTest
from selenium.webdriver.common.keys import Keys as K
import time


class LandingPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url

    def getGlossary(self):
        return self.driver.find_element_by_id('glossary')

    def testLandingPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Explore Campaign Finance Data')

    def testMainSearch(self):
        self.driver.get(self.url)
        main = self.getMain()
        main.find_element_by_class_name('search-bar').send_keys('obama')
        main.find_element_by_class_name('search-submit').click()
        self.elementExistsByClassName('tst-search_results')

    def testGlossaryToggle(self):
        self.driver.get(self.url)
        self.driver.find_element_by_id('glossary-toggle').click()
        glossary = self.getGlossary()
        self.assertIn('side-panel--open', glossary.get_attribute('class'))
        time.sleep(1)
        glossary.find_element_by_id('hide-glossary').click()
        self.assertNotIn('side-panel--open', glossary.get_attribute('class'))

    def testGlossarySearch(self):
        self.driver.get(self.url)
        self.driver.find_element_by_id('glossary-toggle').click()
        glossary = self.getGlossary()
        glossary.find_element_by_id('glossary-search').send_keys('candidate id')
        glossary.find_element_by_id('glossary-search').send_keys(K.ARROW_DOWN)
        glossary.find_element_by_id('glossary-search').send_keys(K.ENTER)
        self.assertIn('Can', glossary.find_element_by_id('glossary-term').text)

    def testGlossaryLoadFromTerm(self):
        self.driver.get(self.url)
        self.driver.find_element_by_class_name('term').click()
        glossary = self.getGlossary()
        self.assertIn('side-panel--open', glossary.get_attribute('class'))
