import unittest

from .base_test_class import BaseTest

from tests.selenium import utils


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
