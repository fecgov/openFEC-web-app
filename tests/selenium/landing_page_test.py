from .base_test_class import BaseTest
from selenium.webdriver.common.keys import Keys as K
from selenium.webdriver.support.ui import WebDriverWait


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
        main.find_element_by_class_name('search-input').send_keys('obama')
        main.find_element_by_class_name('search-submit').click()
        self.elementExistsByClassName('tst-search_results')

    def testGlossaryToggle(self):
        self.driver.get(self.url)
        self.driver.find_element_by_id('glossary-toggle').click()
        glossary = self.getGlossary()
        self.assertIn('side-panel--open', glossary.get_attribute('class'))
        hide = glossary.find_element_by_id('hide-glossary')
        WebDriverWait(self.driver, 1).until(lambda driver: hide.is_displayed())
        hide.click()
        self.assertNotIn('side-panel--open', glossary.get_attribute('class'))

    def testGlossarySearch(self):
        self.driver.get(self.url)
        self.driver.find_element_by_id('glossary-toggle').click()
        glossary = self.getGlossary()
        glossary.find_element_by_id('glossary-search').send_keys('candidate id')
        glossary.find_element_by_id('glossary-search').send_keys(K.ARROW_DOWN)
        glossary.find_element_by_id('glossary-search').send_keys(K.ENTER)
        self.driver.find_element_by_css_selector('#glossary .accordion__button').click()
        self.assertIn('Can', glossary.find_element_by_class_name('glossary-definition').text)

    def testGlossaryLoadFromTerm(self):
        self.driver.get(self.url)
        term = self.driver.find_element_by_class_name('term')
        term.click()
        glossary = self.getGlossary()
        # Glossary is open
        self.assertIn('side-panel--open', glossary.get_attribute('class'))
        highlighted = self.driver.find_elements_by_css_selector('.glossary-term')
        # Exactly one glossary term is highlighted
        self.assertEqual(len(highlighted), 1)
        # Expected term is highlighted
        WebDriverWait(self.driver, 1).until(lambda driver: highlighted[0].text)
        self.assertEqual(term.text.lower(), highlighted[0].text.lower())
        # Definition is expanded
        self.assertTrue(
            self.driver.find_element_by_css_selector('.glossary-definition').text
        )
