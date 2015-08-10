import unittest

from .base_test_class import BaseTest

from tests.selenium import utils


class SingleCommitteePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/committee/C00374058'

    def testSingleCommitteePageLoads(self):
        self.driver.get(self.base_url + '/committees')
        utils.wait_for_event(self.driver, 'draw.dt', 'draw')
        self.driver.find_element_by_css_selector('a[data-category="committee"]').click()

    @unittest.skip('No principal committee links in test subset')
    def testCandidateLink(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.elementExistsByXPath(
                '//a[contains(@href, "candidate/")]'),
            True)
        if self.elementExistsByXPath(
                '//a[contains(@href, "candidate/")]'):
            link = self.driver.find_element_by_xpath(
                '//a[contains(@href, "candidate/")]')
            self.assertEqual(
                link.text,
                'ALLIEGRO, MARK C')
