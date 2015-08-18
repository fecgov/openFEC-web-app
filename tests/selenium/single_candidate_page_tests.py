import unittest

from .base_test_class import BaseTest

from tests.selenium import utils

from selenium.webdriver.support.ui import WebDriverWait


class SingleCandidatePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidate/H0OH08029'

    def testSingleCandidatePageLoads(self):
        self.driver.get(self.base_url + '/candidates')
        utils.wait_for_event(self.driver, 'draw.dt', 'draw')
        self.driver.find_element_by_css_selector('a[data-category="candidate"]').click()

    @unittest.skip('No principal committee links in test subset')
    def testCommitteeLink(self):
        self.driver.get(self.url)
        self.assertTrue(self.elementExistsByXPath('//a[contains(@href, "committee/")]'))
        link = self.driver.find_element_by_xpath('//a[contains(@href, "committees/")]')
        self.assertEqual(link.text, 'OBAMA FOR AMERICA')


    def testGlossaryLoadFromTerm(self):
        self.driver.get(self.url)
        term = self.driver.find_element_by_class_name('term')
        term.click()
        glossary = self.getGlossary()
        # Glossary is open
        self.assertIn('is-open', glossary.get_attribute('class'))
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