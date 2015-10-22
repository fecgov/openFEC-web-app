from .base_test_class import BaseTest
from selenium.webdriver.common.keys import Keys as K
from selenium.webdriver.support.ui import WebDriverWait


class LandingPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url

    def testLandingPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_class_name('tst-page-title').text,
            'Explore campaign finance data')

    def testMainSearch(self):
        self.driver.get(self.url)
        main = self.getMain()
        main.find_element_by_class_name('js-search-input').send_keys('obama')
        main.find_element_by_class_name('button--primary').click()
        self.elementExistsByClassName('tst-search_results')

    def testGlossaryToggle(self):
        self.driver.get(self.url)
        self.driver.find_element_by_css_selector('.js-glossary-toggle').click()
        glossary = self.getGlossary()
        self.assertIn('is-open', glossary.get_attribute('class'))
        self.driver.find_element_by_tag_name('body').send_keys(K.ESCAPE)
        self.assertNotIn('is-open', glossary.get_attribute('class'))

    def testGlossarySearch(self):
        self.driver.get(self.url)
        self.driver.find_element_by_css_selector('.js-glossary-toggle').click()
        glossary = self.getGlossary()
        glossary.find_element_by_id('glossary-search').send_keys('candidate id')
        glossary.find_element_by_id('glossary-search').send_keys(K.ARROW_DOWN)
        glossary.find_element_by_id('glossary-search').send_keys(K.ENTER)
        button = self.driver.find_element_by_css_selector('#glossary .accordion__button')
        WebDriverWait(self.driver, 1).until(lambda driver: button.is_displayed())
        button.click()
        self.assertIn(
            'Can',
            glossary.find_element_by_class_name('glossary-definition').text,
        )
