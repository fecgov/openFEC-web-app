import unittest

from .base_test_class import BaseTest


class SingleCandidatePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidate/H0OH08029'

    def testSingleCandidatePageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'BOEHNER, JOHN A.',
        )

    @unittest.skip('No principal committee links in test subset')
    def testCommitteeLink(self):
        self.driver.get(self.url)
        self.assertTrue(self.elementExistsByXPath('//a[contains(@href, "committee/")]'))
        link = self.driver.find_element_by_xpath('//a[contains(@href, "committees/")]')
        self.assertEqual(link.text, 'OBAMA FOR AMERICA')
