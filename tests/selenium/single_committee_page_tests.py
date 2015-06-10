import unittest

from .base_test_class import BaseTest


class SingleCommitteePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/committee/C00374058'

    def testSingleCommitteePageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'A WHOLE LOT OF PEOPLE FOR GRIJALVA CONGRESSIONAL COMMITTEE',
        )

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
